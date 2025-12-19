import React, { useRef } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Colors from '../../styles/colors';
import { fontSizes } from '../../styles/typography';

const RouteDetailScreen = ({ route }) => {
  const { routeData } = route.params || {};
  const cameraRef = useRef(null);

  if (!routeData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No route data provided.</Text>
      </SafeAreaView>
    );
  }

  const { start, end, coordinates, snappedCoordinates } = routeData;
  const lineCoords = snappedCoordinates?.length ? snappedCoordinates : coordinates;

  return (
    <SafeAreaView style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={start}
          zoomLevel={20}
        />
        {start && (
          <Mapbox.PointAnnotation id="start-detail" coordinate={start}>
            <View style={[styles.marker, styles.markerStart]} />
          </Mapbox.PointAnnotation>
        )}
        {end && (
          <Mapbox.PointAnnotation id="end-detail" coordinate={end}>
            <View style={[styles.marker, styles.markerEnd]} />
          </Mapbox.PointAnnotation>
        )}
        {lineCoords?.length > 1 && (
          <Mapbox.ShapeSource
            id="route-detail"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: lineCoords,
              },
            }}
          >
            <Mapbox.LineLayer
              id="route-detail-line"
              style={{ lineColor: '#3b82f6', lineWidth: 5, lineOpacity: 0.8 }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  map: { flex: 1 },
  errorText: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginTop: 32,
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'white',
  },
  markerStart: {
    backgroundColor: '#10b981',
  },
  markerEnd: {
    backgroundColor: '#ef4444',
  },
});

export default RouteDetailScreen;





