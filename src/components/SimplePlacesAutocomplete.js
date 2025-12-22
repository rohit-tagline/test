import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '../config/apiKeys';

const SimplePlacesAutocomplete = ({ onSelectPlace, placeholder = 'Search location...' }) => {
  const [showResults, setShowResults] = useState(false);
  const [places, setPlaces] = useState([]);

  const handleSearch = (text) => {
    console.log('Searching for:', text);
    setSearchText(text);
    if (!text || text.length < 2) {
      console.log('Search text too short, clearing results');
      setPlaces([]);
      setShowResults(false);
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      text
    )}&key=${GOOGLE_PLACES_API_KEY}&components=country:in`;
    
    console.log('Fetching from URL:', url);
    
    fetch(url)
      .then((response) => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('API Response:', JSON.stringify(data, null, 2));
        if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
          console.log(`Found ${data.predictions.length} predictions`);
          setPlaces(data.predictions);
          setShowResults(true);
        } else {
          console.log('No results or error in response:', data.status, data.error_message || '');
          setPlaces([]);
          setShowResults(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching places:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
        setPlaces([]);
        setShowResults(false);
      });
  };

  const handleSelectPlace = (place) => {
    setShowResults(false);
    if (onSelectPlace) {
      onSelectPlace({
        description: place.description,
        place_id: place.place_id,
      });
    }
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        placeholderTextColor="#999"
        fetchDetails={false}
        onPress={(data) => {
          handleSelectPlace(data);
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en',
          components: 'country:in',
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
          row: styles.row,
          separator: styles.separator,
          description: styles.description,
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
        textInputProps={{
          onChangeText: (text) => {
            handleSearch(text);
          },
          onFocus: () => setShowResults(true),
          onBlur: () => setShowResults(false),
          style: styles.input,
        }}
        enablePoweredByContainer={false}
        listViewDisplayed={showResults}
        renderRow={(item) => (
          <TouchableOpacity
            style={styles.placeItem}
            onPress={() => handleSelectPlace(item)}
          >
            <Text style={styles.placeText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        renderDescription={(row) => row.description || row.vicinity}
      />
      
      {showResults && places.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={places}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.placeItem}
                onPress={() => handleSelectPlace(item)}
              >
                <Text style={styles.placeText}>{item.description}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1000,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  resultsContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  placeText: {
    fontSize: 16,
    color: '#333',
  },
  listView: {
    display: 'none', // Hide the default list view
  },
  row: {
    display: 'none', // Hide the default row
  },
  separator: {
    display: 'none', // Hide the default separator
  },
  description: {
    display: 'none', // Hide the default description
  },
});

export default SimplePlacesAutocomplete;
