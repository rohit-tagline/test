import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  AppState,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import { fontSizes } from '../../styles/typography';
import Colors from '../../styles/colors';
import { gradientProps } from '../../styles/layout';
import useUserStore from '../../zustandstore/userStore';
import { MAPBOX_ACCESS_TOKEN } from '../../config/apiKeys';
import LocationPermissionModal from '../../components/LocationPermissionModal';
import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set as setDb,
  off,
} from 'firebase/database';
import { getFirebaseDb, getFirebaseFirestore } from '../../services/firebaseApp';
import {
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';

// Set your Mapbox token (or use Info.plist / strings.xml)
Mapbox.setAccessToken('pk.eyJ1Ijoicm9oaXQtMjAyNSIsImEiOiJjbWhvdmtoOTQwOGl0Mm1yMW05d25xazB5In0.tdXoTMNxqUyEJ5uugwdPIw');

const HISTORY_KEY = '@route_history';

const MapTrackingScreen = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]); // [lng, lat]
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [usersLocations, setUsersLocations] = useState({});
  const [usersStatus, setUsersStatus] = useState({});
  const [mapStyleUrl, setMapStyleUrl] = useState(Mapbox.StyleURL.Street);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [snappedRouteCoords, setSnappedRouteCoords] = useState([]);


  const appState = useRef(AppState.currentState);

  const cameraRef = useRef(null);
  const userId = useUserStore(state => state.userId);
  const db = getFirebaseDb();
  const firestore = getFirebaseFirestore();

  const centerOnCurrentLocation = () => {
    // If we already have a location and camera ref, recenter immediately
    if (currentLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: currentLocation,
        zoomLevel: 16,
        animationDuration: 800,
      });
      return;
    }

    // Otherwise fetch a fresh location, update state and then recenter
    Geolocation.getCurrentPosition(
      position => {
        const { longitude, latitude } = position.coords;
        const coord = [longitude, latitude];
        setCurrentLocation(coord);
        setRouteCoords(prev =>
          isTracking && prev.length ? [...prev, coord] : prev.length ? prev : [coord],
        );

        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: coord,
            zoomLevel: 16,
            animationDuration: 800,
          });
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const fetchSnappedRoute = async (start, end) => {
    if (!start || !end) return null;
    try {
      const query = `${start[0]},${start[1]};${end[0]},${end[1]}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${query}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.routes || !json.routes.length) return null;
      return json.routes[0].geometry.coordinates || null;
    } catch (e) {
      return null;
    }
  };

  const toggleMapStyle = () => {
    setMapStyleUrl(current =>
      current === Mapbox.StyleURL.Street
        ? Mapbox.StyleURL.SatelliteStreet
        : Mapbox.StyleURL.Street,
    );
  };

  // Request permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      setShowPermissionModal(!granted);
      return granted;
    }

    // On iOS we rely on the system prompt via Mapbox/Geolocation; just hide modal for now
    setShowPermissionModal(false);
    return true;
  };

  // Start tracking session
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location access is required.');
      setShowPermissionModal(true);
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const startCoord = [longitude, latitude];

        setCurrentLocation(startCoord);
        setStartLocation(startCoord);
        setRouteCoords([startCoord]);
        setIsTracking(true);

        // Start watching location with high accuracy and frequent updates
        const id = Geolocation.watchPosition(
          pos => {
            const { longitude, latitude } = pos.coords;
            const newCoord = [longitude, latitude];
            setCurrentLocation(newCoord);
            setRouteCoords(prev => [...prev, newCoord]);
          },
          error => console.log('Watch error:', error),
          {
            enableHighAccuracy: true,
            distanceFilter: 1, // meters; capture fine movement
            interval: 1000, // ms between updates on Android
            fastestInterval: 1000,
            useSignificantChanges: false,
          },
        );
        setWatchId(id);
      },
      (error) => Alert.alert('Error', 'Failed to get location: ' + error.message),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // End tracking and save route
  const endTracking = async () => {
    if (watchId) Geolocation.clearWatch(watchId);
    setIsTracking(false);

    if (routeCoords.length < 2) {
      Alert.alert('Short Route', 'Not enough points to save.');
      return;
    }

    try {
      const endCoord = routeCoords[routeCoords.length - 1];
      const snapped = await fetchSnappedRoute(startLocation, endCoord);
      if (snapped && snapped.length) {
        setSnappedRouteCoords(snapped);
      } else {
        setSnappedRouteCoords([]);
      }

      const route = {
        id: Date.now().toString(),
        start: startLocation,
        end: endCoord,
        coordinates: routeCoords,
        snappedCoordinates: snapped || null,
        timestamp: new Date().toISOString(),
      };

      // Local storage (existing behavior)
      const existing = await AsyncStorage.getItem(HISTORY_KEY);
      const history = existing ? JSON.parse(existing) : [];
      history.push(route);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

      // Persist to Firestore per-user so history survives reinstall
      if (userId && firestore) {
        const routesCol = collection(firestore, 'users', userId, 'routes');
        const routeDoc = doc(routesCol, route.id);
        const firestoreRoute = {
          ...route,
          // Firestore does not allow nested arrays; store coordinates as objects
          coordinates: routeCoords.map(([lng, lat]) => ({ lng, lat })),
          snappedCoordinates: snapped
            ? snapped.map(([lng, lat]) => ({ lng, lat }))
            : null,
        };
        await setDoc(routeDoc, firestoreRoute);
      }

      Alert.alert('Success', 'Route saved to history!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save route.');
      console.log("error", JSON.stringify(e));
      console.log("error", e.message);
    }

    // Optional: Reset for next session
    // setRouteCoords([]);
    // setStartLocation(null);
  };

  // Load current location on mount
  useEffect(() => {
    checkLocationPermission();

    const intervalId = setInterval(() => {
      checkLocationPermission();
    }, 5000);

    const subscription = AppState.addEventListener('change', nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkLocationPermission();
      }
      appState.current = nextState;
    });

    Geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setCurrentLocation([longitude, latitude]);
      },
      () => { },
      { enableHighAccuracy: true }
    );
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  // Presence: mark user online/offline
  useEffect(() => {
    if (!userId || !db) return;
    const statusRef = ref(db, `status/${userId}`);
    const connectedRef = ref(db, '.info/connected');

    const unsubscribe = onValue(connectedRef, snap => {
      if (snap.val() === false) {
        return;
      }
      setDb(statusRef, {
        state: 'online',
        last_changed: Date.now(),
      });
      onDisconnect(statusRef).set({
        state: 'offline',
        last_changed: Date.now(),
      });
    });

    return () => {
      off(connectedRef);
      setDb(statusRef, {
        state: 'offline',
        last_changed: Date.now(),
      });
    };
  }, [db, userId]);

  // Heartbeat: refresh status every 5 seconds so other clients see up-to-date state
  useEffect(() => {
    if (!db || !userId) return;
    const statusRef = ref(db, `status/${userId}`);

    const intervalId = setInterval(() => {
      setDb(statusRef, {
        state: 'online',
        last_changed: Date.now(),
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [db, userId]);

  // Sync current user location to Firebase whenever it changes
  useEffect(() => {
    if (!db || !userId || !currentLocation) return;
    const [lng, lat] = currentLocation;
    const locRef = ref(db, `locations/${userId}`);
    setDb(locRef, {
      lat,
      lng,
      last_updated: Date.now(),
    });
  }, [db, userId, currentLocation]);

  // Also push current location to Firebase every 5 seconds
  useEffect(() => {
    if (!db || !userId) return;

    const intervalId = setInterval(() => {
      if (!currentLocation) return;
      const [lng, lat] = currentLocation;
      const locRef = ref(db, `locations/${userId}`);
      setDb(locRef, {
        lat,
        lng,
        last_updated: Date.now(),
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [db, userId, currentLocation]);

  // Listen for all users' locations and status
  useEffect(() => {
    if (!db) return;
    const locRef = ref(db, 'locations');
    const statusRef = ref(db, 'status');

    const unsubLoc = onValue(locRef, snap => {
      setUsersLocations(snap.val() || {});

    });
    const unsubStatus = onValue(statusRef, snap => {
      setUsersStatus(snap.val() || {});

    });

    return () => {
      off(locRef);
      off(statusRef);
    };
  }, [db]);

  // Follow user during tracking
  useEffect(() => {
    if (isTracking && currentLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: currentLocation,
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  }, [currentLocation, isTracking]);

  return (
    <LinearGradient {...gradientProps} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={''}/>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mapWrapper}>
          <Mapbox.MapView
            style={styles.map}
            zoomEnabled
            pitchEnabled
            scrollEnabled
            rotateEnabled
            compassEnabled
            styleURL={mapStyleUrl}
          >
            <Mapbox.Camera
              ref={cameraRef}
              centerCoordinate={currentLocation || [72.8777, 19.076]} // Default: Mumbai
              zoomLevel={currentLocation ? 16 : 10}
              followUserLocation={isTracking}
              followUserMode="normal"
            />

            {/* User Location (Blue Dot) */}
            {/* {currentLocation && <Mapbox.UserLocation visible={true} />} */}

            <Mapbox.ShapeSource
              id="usersSource"
              shape={{
                type: "FeatureCollection",
                features: Object.entries(usersLocations || {}).map(([id, loc]) => ({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [loc.lng, loc.lat],
                  },
                  properties: {
                    id,
                    status: usersStatus[id]?.state || "offline",
                  },
                })),
              }}
            >
              <Mapbox.CircleLayer
                id="usersLayer"
                style={{
                  circleRadius: 6,
                  circleColor: [
                    "case",
                    ["==", ["get", "status"], "online"],
                    "#22c55e", // green
                    "#ef4444", // red
                  ],
                  circleStrokeColor: "white",
                  circleStrokeWidth: 2,
                }}
              />
            </Mapbox.ShapeSource>


            {/* Start Marker */}
            {startLocation && (
              <Mapbox.PointAnnotation
                id="start"
                coordinate={startLocation}
                title="Start"
              >
                <View style={styles.markerStart} />
              </Mapbox.PointAnnotation>
            )}

            {/* End Marker (only if session ended) */}
            {!isTracking && routeCoords.length > 1 && (
              <Mapbox.PointAnnotation
                id="end"
                coordinate={routeCoords[routeCoords.length - 1]}
                title="End"
              >
                <View style={styles.markerEnd} />
              </Mapbox.PointAnnotation>
            )}

            {/* Live Polyline + breadcrumb points (snapped after session ends) */}
            {(snappedRouteCoords.length > 1 || routeCoords.length > 1) && (
              <Mapbox.ShapeSource
                id="routeSource"
                shape={{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates:
                      snappedRouteCoords.length > 1 && !isTracking
                        ? snappedRouteCoords
                        : routeCoords,
                  },
                }}
              >
                <Mapbox.LineLayer
                  id="routeLine"
                  style={{ lineColor: '#3b82f6', lineWidth: 5, lineOpacity: 0.9 }}
                />
                <Mapbox.CircleLayer
                  id="routeDots"
                  style={{
                    circleRadius: 5,
                    circleColor: '#3ce642ff',
                    circleOpacity: 0.9,
                  }}
                />
              </Mapbox.ShapeSource>
            )}
          </Mapbox.MapView>
          <View style={styles.overlay}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Session</Text>
              <Text style={styles.statusValue}>
                {isTracking ? 'Tracking in progress' : 'Idle'}
              </Text>
              {currentLocation ? (
                <Text style={styles.coordinates}>
                  Lat {currentLocation[1].toFixed(4)} · Lng {currentLocation[0].toFixed(4)}
                </Text>
              ) : (
                <Text style={styles.coordinates}>Locating you...</Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.ctaButton, isTracking && styles.ctaButtonDanger]}
              onPress={isTracking ? endTracking : startTracking}
            >
              <Text style={styles.ctaLabel}>
                {isTracking ? 'End Session' : 'Start Session'}
              </Text>
            </TouchableOpacity>
            <View style={styles.mapControlsRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={centerOnCurrentLocation}
              >
                <Text style={styles.controlText}>GPS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleMapStyle}
              >
                <Text style={styles.controlText}>Map/Sat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <LocationPermissionModal
          visible={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          onOpenSettings={() => {
            Linking.openSettings();
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 ,marginTop: StatusBar.currentHeight || 0},
  mapWrapper: { flex: 1 },
  map: { flex: 1, borderRadius: 15, overflow: 'hidden', margin: 7 },
  overlay: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    alignItems: 'stretch',
  },
  statusCard: {
    backgroundColor: 'rgba(8, 7, 15, 0.85)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  statusValue: {
    color: Colors.textPrimary,
    fontSize: fontSizes.lg,
    marginTop: 4,
    fontWeight: '700',
  },
  coordinates: {
    color: Colors.textSecondary,
    marginTop: 6,
  },
  ctaButton: {
    borderRadius: 20,
    paddingVertical: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
  },
  ctaButtonDanger: {
    backgroundColor: Colors.danger,
  },
  ctaLabel: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  markerStart: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: 'white',
  },
  markerEnd: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: '#ef4444',
    borderWidth: 3,
    borderColor: 'white',
  },
  otherUserMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  mapControlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  controlButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  controlText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.xs,
  },
});

export default MapTrackingScreen;