import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import SimplePlacesAutocomplete from '../components/SimplePlacesAutocomplete';

const MainScreen = ({ navigation }) => {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceSelect = (place) => {
    console.log('Selected place:', place);
    setSelectedPlace(place);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Main Screen</Text>
        <Text style={styles.subtitle}>Select a demo to navigate</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('FirstScreen')}
          >
            <Text style={styles.buttonText}>Notification Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('AnalyticsScreen')}
          >
            <Text style={styles.buttonText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CrashlyticsScreen')}
          >
            <Text style={styles.buttonText}>Crashlytics</Text>
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Text style={styles.sectionTitle}>Search Location</Text>
            <SimplePlacesAutocomplete
              onSelectPlace={handlePlaceSelect}
              placeholder="Search for a place..."
            />
            {selectedPlace && (
              <View style={styles.selectedPlaceContainer}>
                <Text style={styles.selectedPlaceText}>
                  Selected: {selectedPlace.description}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RemoteConfigScreen')}
          >
            <Text style={styles.buttonText}>Remote Config</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('FirebaseNavigation')}
          >
            <Text style={styles.buttonText}>Firebase Auth</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('LocalizationScreen')}
          >
            <Text style={styles.buttonText}>Localization</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('GoogleSheetsLocalizationScreen')}
          >
            <Text style={styles.buttonText}>Google Sheets Localization</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('WizardFormScreen')}
          >
            <Text style={styles.buttonText}>Wizard Form Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('MapboxScreen')}
          >
            <Text style={styles.buttonText}>MapBox Demo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 20,
    zIndex: 1000,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  selectedPlaceContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  selectedPlaceText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MainScreen;

