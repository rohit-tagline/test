import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FirebaseLoginScreen from '../screens/FirebaseLogindemo/FirebaseLoginScreen';
import FirebaseSignUpScreen from '../screens/FirebaseLogindemo/FirebaseSignUpScreen';

const Stack = createStackNavigator();

const FirebaseNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="FirebaseLoginScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="FirebaseLoginScreen" component={FirebaseLoginScreen} />
      <Stack.Screen name="FirebaseSignUpScreen" component={FirebaseSignUpScreen} />
    </Stack.Navigator>
  );
};

export default FirebaseNavigation;


