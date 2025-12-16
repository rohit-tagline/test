import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapboxOnboardingScreen from '../screens/MapboxAuth/MapboxOnboardingScreen';
import MapboxLoginScreen from '../screens/MapboxAuth/MapboxLoginScreen';
import MapboxSignupScreen from '../screens/MapboxAuth/MapboxSignupScreen';
import MapboxScreen from '../screens/Mapbox/MapboxScreen';
import RouteHistoryScreen from '../screens/Mapbox/RouteHistoryScreen';
import RouteDetailScreen from '../screens/Mapbox/RouteDetailScreen';
import ProfileScreen from '../screens/Mapbox/ProfileScreen';
import MapboxBottomTabBar from './MapboxBottomTabBar';
import PlanTourScreen from '../screens/Mapbox/PlanTourScreen';
import useUserStore from '../zustandstore/userStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MapboxTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={props => <MapboxBottomTabBar {...props} />}
  >
    <Tab.Screen
      name="MapboxHome"
      component={MapboxScreen}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="RouteHistory"
      component={RouteHistoryScreen}
      options={{ title: 'History' }}
    />
    <Tab.Screen
      name="PlanTour"
      component={PlanTourScreen}
      options={{ title: 'Plan tour' }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const MapboxNavigation = () => {
  const accessToken = useUserStore(state => state.accessToken);
  const hasSeenOnboarding = useUserStore(state => state.hasSeenOnboarding);

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, presentation: 'card' }}
    >
      {!hasSeenOnboarding && (
        <Stack.Screen
          name="MapboxOnboarding"
          component={MapboxOnboardingScreen}
        />
      )}
      {!accessToken ? (
        <>
          <Stack.Screen name="MapboxLogin" component={MapboxLoginScreen} />
          <Stack.Screen name="MapboxSignup" component={MapboxSignupScreen} />
        </>
      ) : (
        <Stack.Screen name="MapboxTabs" component={MapboxTabs} />
      )}
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} />
    </Stack.Navigator>
  );
};

export default MapboxNavigation;

