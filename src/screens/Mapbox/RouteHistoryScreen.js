import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import { fontSizes } from '../../styles/typography';
import useUserStore from '../../zustandstore/userStore';
import { getFirebaseFirestore } from '../../services/firebaseApp';
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

const HISTORY_KEY = '@route_history';

const RouteHistoryScreen = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);
  const userId = useUserStore(state => state.userId);
  const firestore = getFirebaseFirestore();
  const [isloading, setisloading] = useState(true);

  const loadHistory = async () => {
    try {
      if (userId && firestore) {
        const routesCol = collection(firestore, 'users', userId, 'routes');
        const snapshot = await getDocs(routesCol);
        const remoteRoutes = snapshot.docs
          .map(docSnap => {
            const data = docSnap.data();
            const coords = Array.isArray(data.coordinates)
              ? data.coordinates.map(point =>
                Array.isArray(point) ? point : [point.lng, point.lat],
              )
              : data.coordinates;
            const snapped = Array.isArray(data.snappedCoordinates)
              ? data.snappedCoordinates.map(point =>
                  Array.isArray(point) ? point : [point.lng, point.lat],
                )
              : data.snappedCoordinates;
            return { ...data, coordinates: coords, snappedCoordinates: snapped };
          })
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRoutes(remoteRoutes);
        setisloading(false);
        return;
      }
    } catch (e) {
      // Fallback to local below if Firestore fails
    }

    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    setRoutes(parsed.reverse());
    setisloading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async id => {
    Alert.alert(
      'Delete route',
      'Are you sure you want to delete this route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = routes.filter(r => r.id !== id);
            setRoutes(filtered);

            // Update local cache
            await AsyncStorage.setItem(
              HISTORY_KEY,
              JSON.stringify(filtered.slice().reverse()),
            );

            // Remove from Firestore
            try {
              if (userId && firestore) {
                const routesCol = collection(firestore, 'users', userId, 'routes');
                const routeRef = doc(routesCol, id.toString());
                await deleteDoc(routeRef);
              }
            } catch (e) {
              // Ignore Firestore delete error for now
            }
          },
        },
      ],
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear all routes',
      'This will remove all saved routes. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: async () => {
            setRoutes([]);
            await AsyncStorage.removeItem(HISTORY_KEY);

            try {
              if (userId && firestore) {
                const routesCol = collection(firestore, 'users', userId, 'routes');
                const snapshot = await getDocs(routesCol);
                const batchDeletes = snapshot.docs.map(d => deleteDoc(d.ref));
                await Promise.all(batchDeletes);
              }
            } catch (e) {
              // Ignore Firestore errors for now
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('RouteDetail', { routeData: item })}
    >
      <Text style={styles.title}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.subtitle}>
        Start: {item.start[1].toFixed(4)}, {item.start[0].toFixed(4)}
      </Text>
      <Text style={styles.subtitle}>
        End: {item.end[1].toFixed(4)}, {item.end[0].toFixed(4)}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 ,backgroundColor:Colors.backgroundDark}}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark} />
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Saved Routes</Text>
        {routes.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>
      {isloading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.gradientStart} />
          <Text style={styles.emptyText}>Loading routes...</Text>
        </View>
      ) : (
          routes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No routes saved yet. Start a session from the Home tab.
              </Text>
            </View>
          ) : (
            <FlatList
              data={routes}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )
        )}
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    marginTop: StatusBar.currentHeight || 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  item: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: Colors.border,
    borderWidth: 1,
  },
  deleteText: {
    color: Colors.danger,
    fontSize: fontSizes.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: fontSizes.lg,
  },
  clearText: {
    color: Colors.danger,
    fontSize: fontSizes.sm,
  },
});

export default RouteHistoryScreen;


