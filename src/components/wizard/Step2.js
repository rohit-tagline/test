import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'react-native-element-dropdown';
import {updateStep2} from '../../store/formSlice';

const Step2 = ({next, prev}) => {
  const dispatch = useDispatch();
  const step2 = useSelector(state => state.form.step2);

  const [formData, setFormData] = useState({
    address: step2.address || '',
    country: step2.country || '',
    state: step2.state || '',
    city: step2.city || '',
    zipCode: step2.zipCode || '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const locationData = {
    countries: [
      {label: 'India', value: 'India'},
      {label: 'Brazil', value: 'Brazil'},
      {label: 'Japan', value: 'Japan'},
      {label: 'France', value: 'France'},
      {label: 'South Africa', value: 'South Africa'},
    ],

    states: {
      India: [
        {label: 'Maharashtra', value: 'Maharashtra'},
        {label: 'Tamil Nadu', value: 'Tamil Nadu'},
        {label: 'Karnataka', value: 'Karnataka'},
        {label: 'Delhi', value: 'Delhi'},
        {label: 'West Bengal', value: 'West Bengal'},
      ],
      Brazil: [
        {label: 'São Paulo', value: 'São Paulo'},
        {label: 'Rio de Janeiro', value: 'Rio de Janeiro'},
      ],
      Japan: [
        {label: 'Tokyo', value: 'Tokyo'},
        {label: 'Osaka', value: 'Osaka'},
      ],
      France: [
        {label: 'Île-de-France', value: 'Île-de-France'},
        {
          label: "Provence-Alpes-Côte d'Azur",
          value: "Provence-Alpes-Côte d'Azur",
        },
      ],
      'South Africa': [
        {label: 'Gauteng', value: 'Gauteng'},
        {label: 'Western Cape', value: 'Western Cape'},
      ],
    },

    cities: {
      Maharashtra: [
        {label: 'Mumbai', value: 'Mumbai'},
        {label: 'Pune', value: 'Pune'},
      ],
      'Tamil Nadu': [
        {label: 'Chennai', value: 'Chennai'},
        {label: 'Coimbatore', value: 'Coimbatore'},
      ],
      Karnataka: [
        {label: 'Bangalore', value: 'Bangalore'},
        {label: 'Mysore', value: 'Mysore'},
      ],
      Delhi: [
        {label: 'New Delhi', value: 'New Delhi'},
        {label: 'Delhi Cantonment', value: 'Delhi Cantonment'},
      ],
      'West Bengal': [
        {label: 'Kolkata', value: 'Kolkata'},
        {label: 'Howrah', value: 'Howrah'},
      ],
      'São Paulo': [
        {label: 'São Paulo', value: 'São Paulo'},
        {label: 'Campinas', value: 'Campinas'},
      ],
      'Rio de Janeiro': [
        {label: 'Rio de Janeiro', value: 'Rio de Janeiro'},
        {label: 'Niterói', value: 'Niterói'},
      ],
      Tokyo: [
        {label: 'Shinjuku', value: 'Shinjuku'},
        {label: 'Shibuya', value: 'Shibuya'},
      ],
      Osaka: [
        {label: 'Osaka', value: 'Osaka'},
        {label: 'Sakai', value: 'Sakai'},
      ],
      'Île-de-France': [
        {label: 'Paris', value: 'Paris'},
        {label: 'Boulogne-Billancourt', value: 'Boulogne-Billancourt'},
      ],
      "Provence-Alpes-Côte d'Azur": [
        {label: 'Marseille', value: 'Marseille'},
        {label: 'Nice', value: 'Nice'},
      ],
      Gauteng: [
        {label: 'Johannesburg', value: 'Johannesburg'},
        {label: 'Pretoria', value: 'Pretoria'},
      ],
      'Western Cape': [
        {label: 'Cape Town', value: 'Cape Town'},
        {label: 'Stellenbosch', value: 'Stellenbosch'},
      ],
    },
  };

  const handleCountryFocus = async () => {
    setFormData({
      ...formData,
      country: '',
    });
    if (countries.length === 0) {
      setCountries(locationData.countries);
    }
  };

  const handleStateFocus = async () => {
    if (!formData.country) {
      Alert.alert('Error', 'Please select country first');
      return;
    }
    if (states.length === 0) {
      setStates(locationData.states[formData.country]);
    }
  };

  const handleCityFocus = async () => {
    if (!formData.state) {
      Alert.alert('Error', 'Please select state first');
      return;
    }
    if (cities.length === 0) {
      setCities(locationData.cities[formData.state]);
    }
  };

  const handleCountryChange = country => {
    if (country === formData.country) return;

    setFormData({
      ...formData,
      country,
      state: '',
      city: '',
    });
    setStates([]);
    setCities([]);
  };

  const handleStateChange = state => {
    if (state === formData.state) return;

    setFormData({
      ...formData,
      state,
      city: '',
    });
    setCities([]);
  };

  const handleCityChange = city => {
    setFormData({
      ...formData,
      city,
    });
  };

  const handleNext = () => {
    if (
      !formData.address ||
      !formData.country ||
      !formData.state ||
      !formData.city ||
      !formData.zipCode
    ) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }
    if (!/^\d+$/.test(formData.zipCode)) {
      Alert.alert('Error', 'Invalid zip code');
      return;
    }
    dispatch(updateStep2(formData));
    next();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.heading}>Address Details</Text>

        <Dropdown
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          data={countries}
          labelField="label"
          valueField="value"
          placeholder={formData.country || 'Select Country'}
          placeholderStyle={{color: 'grey'}}
          value={formData.country}
          onChange={item => handleCountryChange(item.value)}
          onFocus={handleCountryFocus}
          search
          searchPlaceholder="search name of country"
          activeColor="white"
        />

        <Dropdown
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          data={states}
          labelField="label"
          valueField="value"
          placeholder={
            formData.state ||
            (formData.country ? 'Select State' : 'Select country first')
          }
          placeholderStyle={{color: 'grey'}}
          value={formData.state}
          onChange={item => handleStateChange(item.value)}
          onFocus={handleStateFocus}
          disable={!formData.country}
          activeColor="white"
          search
          searchPlaceholder="search name of state"
        />

        <Dropdown
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          data={cities}
          labelField="label"
          valueField="value"
          placeholder={
            formData.city ||
            (formData.state ? 'Select City' : 'Select state first')
          }
          placeholderStyle={{color: 'grey'}}
          value={formData.city}
          onChange={item => handleCityChange(item.value)}
          onFocus={handleCityFocus}
          disable={!formData.state}
          activeColor="white"
          search
          searchPlaceholder="search name of city"
        />

        <TextInput
          style={styles.input}
          placeholder="Street Address"
          placeholderTextColor={'grey'}
          value={formData.address}
          onChangeText={text => setFormData({...formData, address: text})}
          maxLength={40}
          submitBehavior="blurAndSubmit"
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Zip Code"
          keyboardType="numeric"
          value={formData.zipCode}
          onChangeText={text => setFormData({...formData, zipCode: text})}
          maxLength={6}
          placeholderTextColor={'grey'}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.prevButton} onPress={prev}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!formData.address ||
                !formData.country ||
                !formData.state ||
                !formData.city ||
                !formData.zipCode) &&
                styles.disabledButton,
            ]}
            onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: 'black',
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  nextButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  prevButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Step2;

