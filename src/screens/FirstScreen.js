import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, StyleSheet, AppState, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

const FirstScreen = () => {
  const [fcmToken, setFcmToken] = useState('Token not available');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Check permissions on mount
    checkPermissions();

    // Foreground message listener
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);
      await displayNotification(remoteMessage);
    });

    // Handle notification taps (foreground)
    const unsubscribeForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
      handleNotificationEvent(type, detail);
    });

    // NOTE: Background events must be registered at the app entry point and
    // are not unsubscribable. Do not create a background subscription here.

    // Check for initial notification (app opened from terminated state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Opened from terminated notification:', remoteMessage);
          // Handle data or navigation
        }
      });

    // Listen for app state changes (e.g., back from settings)
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground; delay check by 0.1s
        setTimeout(() => {
          checkPermissions();
        }, 100);
      }
      appState.current = nextAppState;
    });

    return () => {
      unsubscribeForeground();
      unsubscribeForegroundEvent();
      subscription.remove();
    };
  }, []);

  const checkPermissions = async () => {
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED;

    if (enabled) {
      console.log('Permissions granted');
      getFcmToken();
    } else {
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications in your device settings to receive alerts.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openSettings();
                setTimeout(() => {
                  checkPermissions();
                }, 100);
              } else {
                notifee.requestPermission();
                // notifee.openNotificationSettings(); // iOS-specific
              }
              // Re-check after 0.1s when app returns to foreground
              setTimeout(() => {
                checkPermissions();
              }, 500);
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Permission granted after request');
      getFcmToken();
    } else {
      // Permission denied or blocked; show alert to open settings
      Alert.alert(
        'Notification Permission Required',
        'Please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const getFcmToken = async () => {
    const token = await messaging().getToken();
    if (token) {
      setFcmToken(token);
      console.log('FCM Token:', token);
      // Optionally, send to your server here
    } else {
      setFcmToken('Token not available');
    }
  };

  const triggerLocalNotification = async () => {
    const channelId = await notifee.createChannel({
      id: 'local',
      name: 'Local Channel',
    });

    await notifee.displayNotification({
      title: 'Local Notification',
      body: 'This is a test local notification!',
      android: { channelId },
    });
  };

  const handleNotificationEvent = ({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Notification pressed:', detail.notification?.data);
      Alert.alert('Notification Tapped', `Data: ${JSON.stringify(detail.notification?.data)}`);
    }
  };

  const displayNotification = async (remoteMessage) => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Foreground Notification',
      body: remoteMessage.notification?.body || remoteMessage.data?.body || 'Custom Body',
      data: remoteMessage.data,
      android: { channelId },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FirstScreen</Text>
      <Text style={styles.subtitle}>Notification Test Screen</Text>
      <Text style={styles.token}>FCM Token: {fcmToken}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Send Local Notification" onPress={triggerLocalNotification} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  token: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default FirstScreen;