import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import analytics from '@react-native-firebase/analytics';

const {width} = Dimensions.get('window');

const FirebaseAnalytics = () => {
  const logPredefinedEvent = async () => {
    await analytics().logLogin({method:'facebook.com'});
    ToastAndroid.show('Predefined event "login" fired', ToastAndroid.SHORT);
  };

  const logCustomEvent = async () => {
    await analytics().logEvent('Product_selected', {
      product_id: '12345',
      product_name: 'Cool T-shirt',
      category: 'Apparel',
      price: 350,
      currency: 'INR',
      color: 'Blue',
      size: 'M',
      user_id: '12345',
      screen: 'FirebaseAnalytics',
      timestamp: new Date().toISOString(),
      location: 'India',
      retailername: 'Amazon',
      discount: '10%',
      payment_method: 'home_delivery',
    });
    ToastAndroid.show(
      'Custom event "Product_selected" fired',
      ToastAndroid.SHORT,
    );
  };

  const logReservedevent = async () => {
    try {
      await analytics().logEvent('first_open', {});
    } catch (error) {
      Alert.alert("Error",error.message);
      
      console.log(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/2323/2323800.png',
          }}
          style={styles.headerIcon}
          resizeMode="contain"
        />
        <Text style={styles.title}>Firebase Analytics</Text>
      </View>

      {/* Event Cards */}
      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.autoCard]}>
          <View style={styles.cardHeader}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/1728/1728411.png',
              }}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Reserved Events</Text>
          </View>
          <Text style={styles.cardText}>
            Events like first_open and session_start are collected
            automatically.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={logReservedevent}>
            <Text style={styles.buttonText}>Trigger first_open</Text>
          </TouchableOpacity>
        </View>

        {/* Predefined Event */}
        <View style={[styles.card, styles.predefinedCard]}>
          <View style={styles.cardHeader}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/17772/17772678.png',
              }}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Predefined Events</Text>
          </View>
          <Text style={styles.cardText}>
            Standard events like login, sign_up, and purchase with predefined
            parameters.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={logPredefinedEvent}>
            <Text style={styles.buttonText}>Log "login" Event</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Event */}
        <View style={[styles.card, styles.customCard]}>
          <View style={styles.cardHeader}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/18245/18245236.png',
              }}
              style={styles.cardIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Custom Events</Text>
          </View>
          <Text style={styles.cardText}>
            Track any custom user interaction with your own event names and
            parameters.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={logCustomEvent}>
            <Text style={styles.buttonText}>Log "Product" Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    width: 48,
    height: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  cardContainer: {
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: width - 40,
  },
  autoCard: {
    borderTopWidth: 4,
    borderTopColor: '#4a6da7',
  },
  predefinedCard: {
    borderTopWidth: 4,
    borderTopColor: '#388e3c',
  },
  customCard: {
    borderTopWidth: 4,
    borderTopColor: '#d32f2f',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#4a6da7',
  },
  successButton: {
    backgroundColor: '#388e3c',
  },
  dangerButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoText: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default FirebaseAnalytics;