import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainScreen from '../screens/MainScreen';
import FirstScreen from '../screens/FirstScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import CrashlyticsScreen from '../screens/CrashlyticsScreen';
import RemoteConfigScreen from '../screens/RemoteConfigScreen';
import FirebaseNavigation from './FirebaseNavigation';
import LocalizationScreen from '../screens/LocalizationScreen';
import GoogleSheetsLocalizationScreen from '../screens/GoogleSheetsLocalizationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WizardFormScreen from '../screens/WizardFormScreen';
import MapboxScreen from '../screens/Mapbox/MapboxScreen';
import MapboxNavigation from './MapboxNavigation';



const Stack = createStackNavigator();



const MainNavigation = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem('onboardingDone');
      setInitialRoute(done ? 'MainScreen' : 'Onboarding');
    })();
  }, []);

  // Show a tiny splash while checking storage
  if (!initialRoute) return null;
  return (

    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false,animation:'slide_from_right' }}
    >
      {/* Onboarding – shown only the first time */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}

      />

      <Stack.Screen
        name="MainScreen"
        component={MainScreen}

      />
      <Stack.Screen
        name="FirstScreen"
        component={FirstScreen}

      />
      <Stack.Screen
        name="AnalyticsScreen"
        component={AnalyticsScreen}

      />
      <Stack.Screen
        name="CrashlyticsScreen"
        component={CrashlyticsScreen}

      />
      <Stack.Screen
        name="RemoteConfigScreen"
        component={RemoteConfigScreen}

      />
      <Stack.Screen
        name="FirebaseNavigation"
        component={FirebaseNavigation}

      />
      <Stack.Screen
        name="LocalizationScreen"
        component={LocalizationScreen}

      />
      <Stack.Screen
        name="GoogleSheetsLocalizationScreen"
        component={GoogleSheetsLocalizationScreen}

      />
      <Stack.Screen
        name="WizardFormScreen"
        component={WizardFormScreen}

      />
      <Stack.Screen
        name="MapboxScreen"
        component={MapboxScreen}

      />
      <Stack.Screen
        name="MapboxFlow"
        component={MapboxNavigation}

      />
    </Stack.Navigator>

  );
};

export default MainNavigation;
