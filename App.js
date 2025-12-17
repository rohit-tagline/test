import React from 'react';
import MainNavigation from './src/navigation/MainNavigation';
import { NavigationContainer } from '@react-navigation/native';
import MapboxNavigation from './src/navigation/MapboxNavigation';

const App = () => {
  return (
    <NavigationContainer>
      {/* <MainNavigation /> */}
      <MapboxNavigation />
    </NavigationContainer>
  );
};

export default App;