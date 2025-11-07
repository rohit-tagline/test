import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

const FirebaseCrashlytics = () => {

  const generateCrash = () => {
    crashlytics().log('Generating log in CrashlyticsScreen before crash...');
    crashlytics().crash(); // Test crash
  };

 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Crashlytics Demo</Text>

      <View style={styles.buttonContainer}>
        <Button title="Generate Crash" onPress={generateCrash} color="#F44336" />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
});

export default FirebaseCrashlytics;