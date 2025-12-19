import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import Colors from '../../styles/colors';
import { fontSizes } from '../../styles/typography';
import useUserStore from '../../zustandstore/userStore';
import { getFirebaseFirestore } from '../../services/firebaseApp';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { MAPBOX_ACCESS_TOKEN, GOOGLE_PLACES_API_KEY } from '../../config/apiKeys';

const PlanTourScreen = () => {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'plans'
  const [startPlace, setStartPlace] = useState(null);
  const [endPlace, setEndPlace] = useState(null);
  const [plannedCoords, setPlannedCoords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [planName, setPlanName] = useState('');
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [mapStyleUrl, setMapStyleUrl] = useState(Mapbox.StyleURL.Street);
  const [mapStyleModalVisible, setMapStyleModalVisible] = useState(false);

  const userId = useUserStore(state => state.userId);
  const firestore = getFirebaseFirestore();
  const startAutocompleteRef = useRef(null);
  const endAutocompleteRef = useRef(null);
  const cameraRef = useRef(null);

  const loadPlans = async () => {
    if (!userId || !firestore) return;
    const plansCol = collection(firestore, 'users', userId, 'plans');
    const snapshot = await getDocs(plansCol);
    const remotePlans = snapshot.docs
      .map(d => {
        const data = d.data();
        const coords = Array.isArray(data.coordinates)
          ? data.coordinates.map(point =>
              Array.isArray(point) ? point : [point.lng, point.lat],
            )
          : [];
        return {
          ...data,
          coordinates: coords,
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setPlans(remotePlans);
  };

  useEffect(() => {
    loadPlans();
  }, [userId]);

  const fetchDirections = async (start, end) => {
    const query = `${start[0]},${start[1]};${end[0]},${end[1]}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${query}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const json = await response.json();
    if (!json.routes || !json.routes.length) {
      throw new Error('No route found between the selected locations.');
    }
    return json.routes[0].geometry.coordinates || [];
  };

  const handlePreviewRoute = async () => {
    if (!startPlace?.coordinates || !endPlace?.coordinates) {
      Alert.alert('Select locations', 'Please choose both start and destination.');
      return;
    }

    try {
      setIsFetchingRoute(true);
      setRouteError(null);
      const coords = await fetchDirections(startPlace.coordinates, endPlace.coordinates);
      setPlannedCoords(coords);
      // Update camera to show the full route
      if (coords.length > 0 && cameraRef.current) {
        const midIndex = Math.floor(coords.length / 2);
        cameraRef.current.setCamera({
          centerCoordinate: coords[midIndex],
          zoomLevel: 12,
          animationDuration: 1000,
        });
      }
      setSaveModalVisible(true);
    } catch (error) {
      setRouteError(error.message);
      Alert.alert('Route error', error.message);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const handleSavePlan = async () => {
    if (!userId || !firestore || plannedCoords.length < 2 || !startPlace || !endPlace) {
      setSaveModalVisible(false);
      return;
    }
    const id = Date.now().toString();
    const start = startPlace.coordinates;
    const end = endPlace.coordinates;
    const plan = {
      id,
      name: planName || 'Planned route',
      start,
      end,
      coordinates: plannedCoords,
      startName: startPlace.description,
      endName: endPlace.description,
      timestamp: new Date().toISOString(),
    };

    const plansCol = collection(firestore, 'users', userId, 'plans');
    const planDoc = doc(plansCol, id);
    await setDoc(planDoc, {
      ...plan,
      coordinates: plannedCoords.map(([lng, lat]) => ({ lng, lat })),
    });
    setPlans(prev => [plan, ...prev]);
    setSaveModalVisible(false);
    setPlanName('');
    setRouteError(null);
  };

  const handleLoadPlan = plan => {
    setActiveTab('plan');
    setPlannedCoords(plan.coordinates || []);
    const startObj = plan.start
      ? { description: plan.startName || 'Start', coordinates: plan.start }
      : null;
    const endObj = plan.end
      ? { description: plan.endName || 'Destination', coordinates: plan.end }
      : null;
    setStartPlace(startObj);
    setEndPlace(endObj);
    startAutocompleteRef.current?.setAddressText(startObj?.description || '');
    endAutocompleteRef.current?.setAddressText(endObj?.description || '');
    setPlanName(plan.name || '');
    
    // Update camera to show the loaded plan
    setTimeout(() => {
      if (plan.coordinates && plan.coordinates.length > 0 && cameraRef.current) {
        const midIndex = Math.floor(plan.coordinates.length / 2);
        cameraRef.current.setCamera({
          centerCoordinate: plan.coordinates[midIndex],
          zoomLevel: 12,
          animationDuration: 800,
        });
      } else if ((startObj || endObj) && cameraRef.current) {
        const coord = startObj?.coordinates || endObj?.coordinates;
        cameraRef.current.setCamera({
          centerCoordinate: coord,
          zoomLevel: startObj && endObj ? 11 : 14,
          animationDuration: 800,
        });
      }
    }, 100);
  };

  const handleDeletePlan = async id => {
    Alert.alert('Delete plan', 'Remove this saved plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setPlans(prev => prev.filter(p => p.id !== id));
          if (!userId || !firestore) return;
          const plansCol = collection(firestore, 'users', userId, 'plans');
          const planRef = doc(plansCol, id);
          await deleteDoc(planRef);
        },
      },
    ]);
  };

  const renderTabsHeader = () => (
    <View style={styles.topTabsRow}>
      <TouchableOpacity
        style={[styles.topTab, activeTab === 'plan' && styles.topTabActive]}
        onPress={() => setActiveTab('plan')}
      >
        <Text
          style={[styles.topTabLabel, activeTab === 'plan' && styles.topTabLabelActive]}
        >
          Plan route
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.topTab, activeTab === 'plans' && styles.topTabActive]}
        onPress={() => setActiveTab('plans')}
      >
        <Text
          style={[styles.topTabLabel, activeTab === 'plans' && styles.topTabLabelActive]}
        >
          My plans
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlanTab = () => (
    <SafeAreaView style={styles.planContainer} edges={['bottom']}>
      <View style={styles.inputsColumn}>
        <Text style={styles.inputLabel}>From</Text>
        <View style={styles.autocompleteWrapper}>
          <GooglePlacesAutocomplete
            ref={startAutocompleteRef}
            placeholder="Search start location"
            placeholderTextColor={Colors.textSecondary}
            fetchDetails
            onPress={(data, details = null) => {
              if (!details?.geometry?.location) return;
              const { lat, lng } = details.geometry.location;
              const coord = [lng, lat];
              setStartPlace({ description: data.description, coordinates: coord });
              // Update camera to show start location
              if (cameraRef.current) {
                cameraRef.current.setCamera({
                  centerCoordinate: coord,
                  zoomLevel: 14,
                  animationDuration: 800,
                });
              }
            }}
            GooglePlacesDetailsQuery={{ fields: 'geometry' }}
            query={{ 
              key: GOOGLE_PLACES_API_KEY, 
              language: 'en',
            }}
            currentLocation
            currentLocationLabel="Current location"
            styles={autocompleteStyles}
            debounce={300}
            minLength={2}
            enablePoweredByContainer={false}
            listViewDisplayed={true}
            keepResultsAfterBlur={false}
            keyboardShouldPersistTaps="handled"
            textInputProps={{
              returnKeyType: 'search',
              placeholderTextColor: Colors.textSecondary,
            }}
          />
        </View>
      </View>
      <View style={[styles.inputsColumn, { marginTop: 12 }]}>
        <Text style={styles.inputLabel}>To</Text>
        <View style={styles.autocompleteWrapper}>
          <GooglePlacesAutocomplete
            ref={endAutocompleteRef}
            placeholder="Search destination"
            placeholderTextColor={Colors.textSecondary}
            fetchDetails
            onPress={(data, details = null) => {
              if (!details?.geometry?.location) return;
              const { lat, lng } = details.geometry.location;
              const coord = [lng, lat];
              setEndPlace({ description: data.description, coordinates: coord });
              // Update camera to show end location or both if start is set
              if (cameraRef.current) {
                if (startPlace?.coordinates) {
                  // Center between start and end
                  const midLat = (startPlace.coordinates[1] + lat) / 2;
                  const midLng = (startPlace.coordinates[0] + lng) / 2;
                  cameraRef.current.setCamera({
                    centerCoordinate: [midLng, midLat],
                    zoomLevel: 12,
                    animationDuration: 800,
                  });
                } else {
                  cameraRef.current.setCamera({
                    centerCoordinate: coord,
                    zoomLevel: 14,
                    animationDuration: 800,
                  });
                }
              }
            }}
            query={{ 
              key: GOOGLE_PLACES_API_KEY, 
              language: 'en',
            }}
            styles={autocompleteStyles}
            debounce={300}
            minLength={2}
            enablePoweredByContainer={false}
            listViewDisplayed={true}
            keepResultsAfterBlur={false}
            keyboardShouldPersistTaps="handled"
            textInputProps={{
              returnKeyType: 'search',
              placeholderTextColor: Colors.textSecondary,
            }}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.previewButton} onPress={handlePreviewRoute} disabled={isFetchingRoute}>
        <Text style={styles.previewLabel}>Show route</Text>
      </TouchableOpacity>
      {routeError ? <Text style={styles.errorText}>{routeError}</Text> : null}
      <View style={styles.mapWrapper}>
        {isFetchingRoute && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={Colors.textPrimary} size="large" />
          </View>
        )}
        <Mapbox.MapView style={styles.map} styleURL={mapStyleUrl}>
          <Mapbox.Camera
            ref={cameraRef}
            centerCoordinate={
              plannedCoords.length > 0
                ? plannedCoords[Math.floor(plannedCoords.length / 2)]
                : startPlace?.coordinates || endPlace?.coordinates || [72.8777, 19.076]
            }
            zoomLevel={
              plannedCoords.length > 1
                ? 12
                : startPlace?.coordinates && endPlace?.coordinates
                ? 11
                : startPlace?.coordinates || endPlace?.coordinates
                ? 14
                : 4
            }
          />
          {/* Show user's current location (blue dot) */}
          <Mapbox.UserLocation visible={true} />
          {/* Start marker */}
          {startPlace?.coordinates && (
            <Mapbox.PointAnnotation
              id="startMarker"
              coordinate={startPlace.coordinates}
              title="Start"
            >
              <View style={styles.startMarker} />
            </Mapbox.PointAnnotation>
          )}
          {/* End marker */}
          {endPlace?.coordinates && (
            <Mapbox.PointAnnotation
              id="endMarker"
              coordinate={endPlace.coordinates}
              title="End"
            >
              <View style={styles.endMarker} />
            </Mapbox.PointAnnotation>
          )}
          {plannedCoords.length > 1 && (
            <Mapbox.ShapeSource
              id="plannedRouteSource"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: plannedCoords,
                },
              }}
            >
              <Mapbox.LineLayer
                id="plannedRouteLine"
                style={{ lineColor: '#3b82f6', lineWidth: 4, lineOpacity: 0.9 }}
              />
              <Mapbox.CircleLayer
                id="plannedRouteDots"
                style={{
                  circleRadius: 3,
                  circleColor: '#ffffff',
                  circleOpacity: 0.9,
                }}
              />
            </Mapbox.ShapeSource>
          )}
        </Mapbox.MapView>
        {/* Right-side vertical controls */}
        <View style={styles.mapControlsColumn}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => {
              Geolocation.getCurrentPosition(
                pos => {
                  const { longitude, latitude } = pos.coords;
                  const coord = [longitude, latitude];
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
            }}
          >
            <Text style={styles.mapControlText}>GPS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setMapStyleModalVisible(true)}
          >
            <Text style={styles.mapControlText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderMyPlansTab = () => (
    <SafeAreaView style={styles.myPlansContainer} edges={['bottom']}>
      {plans.length === 0 ? (
        <Text style={styles.emptyText}>No plans saved yet.</Text>
      ) : (
        plans.map(plan => (
          <TouchableOpacity key={plan.id} style={styles.planItem} onPress={() => handleLoadPlan(plan)}>
            <Text style={styles.planTitle}>{plan.name}</Text>
            <Text style={styles.planSubtitle}>From: {plan.startName || '—'}</Text>
            <Text style={styles.planSubtitle}>To: {plan.endName || '—'}</Text>
            <Text style={styles.planTimestamp}>{new Date(plan.timestamp).toLocaleString()}</Text>
            <View style={styles.planActionsRow}>
              <TouchableOpacity
                style={styles.planDeleteButton}
                onPress={() => handleDeletePlan(plan.id)}
              >
                <Text style={styles.planDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderTabsHeader()}
      {activeTab === 'plan' ? renderPlanTab() : renderMyPlansTab()}
      <Modal
        visible={saveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save plan</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Plan name"
              placeholderTextColor={Colors.textSecondary}
              value={planName}
              onChangeText={setPlanName}
            />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.planActionButton}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.planActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.planActionButton}
                onPress={handleSavePlan}
              >
                <Text style={styles.planActionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Map style picker sliding from right */}
      <Modal
        visible={mapStyleModalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setMapStyleModalVisible(false)}
      >
        <View style={styles.styleModalBackdrop}>
          <View style={styles.styleModalContent}>
            <Text style={styles.styleModalTitle}>Map type</Text>
            <TouchableOpacity
              style={styles.styleOption}
              onPress={() => {
                setMapStyleUrl(Mapbox.StyleURL.Street);
                setMapStyleModalVisible(false);
              }}
            >
              <Text style={styles.styleOptionText}>Street</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.styleOption}
              onPress={() => {
                setMapStyleUrl(Mapbox.StyleURL.SatelliteStreet);
                setMapStyleModalVisible(false);
              }}
            >
              <Text style={styles.styleOptionText}>Satellite</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.styleOption}
              onPress={() => {
                setMapStyleUrl(Mapbox.StyleURL.Dark);
                setMapStyleModalVisible(false);
              }}
            >
              <Text style={styles.styleOptionText}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  topTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  topTabActive: {
    backgroundColor: Colors.card,
  },
  topTabLabel: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  topTabLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  planContainer: {
    flex: 1,
    padding: 16,
  },
  inputsColumn: {
    marginBottom: 10,
    zIndex: 1000,
  },
  autocompleteWrapper: {
    zIndex: 1000,
    elevation: 5,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: fontSizes.xs,
    marginBottom: 3,
  },
  previewButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.success,
    marginBottom: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  previewLabel: {
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapControlsColumn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  mapControlButton: {
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mapControlText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.xs,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  errorText: {
    color: Colors.danger,
    marginBottom: 8,
  },
  myPlansContainer: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: fontSizes.md,
  },
  startMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: 'white',
  },
  endMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    borderWidth: 3,
    borderColor: 'white',
  },
  planItem: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planTitle: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
  },
  planSubtitle: {
    color: Colors.textSecondary,
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
  planTimestamp: {
    color: Colors.textSecondary,
    fontSize: fontSizes.xs,
    marginTop: 4,
  },
  planActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  planDeleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  planDeleteText: {
    color: Colors.danger,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    width: '85%',
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: fontSizes.lg,
    marginBottom: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  styleModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  styleModalContent: {
    width: 200,
    backgroundColor: Colors.card,
    padding: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  styleModalTitle: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
    marginBottom: 8,
  },
  styleOption: {
    paddingVertical: 8,
  },
  styleOptionText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
  },
  planActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  planActionText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});

const autocompleteStyles = StyleSheet.create({
  container: {
    flex: 0,
    zIndex: 1000,
    elevation: 5,
  },
  textInputContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 1000,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textInput: {
    height: 44,
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderWidth: 0,
  },
  listView: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginTop: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
    position: 'absolute',
    width: '100%',
    top: 48,
  },
  row: {
    padding: 12,
    backgroundColor: Colors.card,
    minHeight: 44,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  description: {
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
  },
  predefinedPlacesDescription: {
    color: Colors.textSecondary,
    fontSize: fontSizes.xs,
  },
  poweredContainer: {
    display: 'none',
  },
  powered: {
    display: 'none',
  },
});

export default PlanTourScreen;
