import React from 'react';
import MainNavigation from './src/navigation/MainNavigation';
import { NavigationContainer } from '@react-navigation/native';

const App = () => {
  return <NavigationContainer>
    <MainNavigation />
  </NavigationContainer>
};

export default App;