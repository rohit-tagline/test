import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'react-native-element-dropdown';
import {launchImageLibrary} from 'react-native-image-picker';
import {updateStep1} from '../../reduxstore/formSlice';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const genderOptions = [
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
  {label: 'Other', value: 'other'},
];

const Step1 = ({next}) => {
  const emailRef = useRef(null);
  const LNameRef = useRef(null);
  const PhoneRef = useRef(null);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const dispatch = useDispatch();
  const step1 = useSelector(state => state.form.step1);
  const [formData, setFormData] = useState({
    firstName: step1.firstName,
    lastName: step1.lastName,
    email: step1.email,
    phone: step1.phone,
    gender: step1.gender,
    dob: step1.dob,
    imageUri: step1.imageUri,
  });

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirmDate = selectedDate => {
    setFormData({...formData, dob: selectedDate});
    hideDatePicker();
  };

  const handleImagePick = () => {
    launchImageLibrary({}, response => {
      if (response.assets?.[0]?.uri) {
        setFormData({...formData, imageUri: response.assets[0].uri});
      }
    });
  };

  const validate = () => {
    const emailRegex = /^(?!\.)(?!.*\.\.)(?!.*\.$)([a-z0-9]+(?:\.[a-zA-Z0-9]+)*)@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    const nameRegex = /^[A-Za-z]+\s*$/;

    if (!Object.values(formData).every(Boolean)) {
      Alert.alert('Error', 'All fields are required!');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Invalid email!');
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert('Error', 'Invalid phone number!');
      return false;
    }
    if (!nameRegex.test(formData.firstName)) {
      Alert.alert('Error', 'Invalid First Name!');
      return false;
    }
    if (!nameRegex.test(formData.lastName)) {
      Alert.alert('Error', 'Invalid Last Name!');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    dispatch(updateStep1(formData));
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
        <Text style={styles.heading}>Personal Details</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor={'grey'}
          value={formData.firstName}
          onChangeText={t => setFormData({...formData, firstName: t})}
          submitBehavior="submit"
          returnKeyType="next"
          onSubmitEditing={() => LNameRef.current.focus()}
          maxLength={10}
          keyboardType="default"
          autoCapitalize={'sentences'}
        />

        <TextInput
          ref={LNameRef}
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor={'grey'}
          value={formData.lastName}
          onChangeText={t => setFormData({...formData, lastName: t})}
          submitBehavior="submit"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current.focus()}
          maxLength={10}
          keyboardType="default"
          autoCapitalize="sentences"
        />

        <TextInput
          ref={emailRef}
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={'grey'}
          value={formData.email}
          onChangeText={t => setFormData({...formData, email: t})}
          submitBehavior="submit"
          returnKeyType="next"
          onSubmitEditing={() => PhoneRef.current.focus()}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          ref={PhoneRef}
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor={'grey'}
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={t => setFormData({...formData, phone: t})}
          submitBehavior="blurAndSubmit"
          returnKeyType="next"
          maxLength={10}
        />

        <TouchableOpacity
          onPress={showDatePicker}
          style={[
            styles.input,
            {
              flexDirection: 'row',
              padding: 10,
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}>
          <TextInput
            style={{marginLeft: 10, flex: 1}}
            placeholder="Date of Birth (YYYY-MM-DD)"
            placeholderTextColor={'grey'}
            value={formData.dob}
            onChangeText={t => setFormData({...formData, dob: t})}
            editable={false}
          />
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/833/833593.png',
            }}
            style={{width: 28, height: 25, tintColor: 'grey', marginRight: 10}}
          />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          isDarkModeEnabled={false}
          mode="date"
          themeVariant="light"
          onConfirm={selectedDate => {
            const today = new Date();
            const age = today.getFullYear() - selectedDate.getFullYear();
            const monthDifference = today.getMonth() - selectedDate.getMonth();
            const dayDifference = today.getDate() - selectedDate.getDate();

            const adjustedAge =
              monthDifference < 0 ||
              (monthDifference === 0 && dayDifference < 0)
                ? age - 1
                : age;

            if (adjustedAge >= 10) {
              const date = selectedDate.toDateString();
              setFormData({...formData, dob: date});
            } else {
              Alert.alert('You must be at least 10 years old.');
            }

            hideDatePicker();
          }}
          onCancel={hideDatePicker}
        />

        <Dropdown
          activeColor="white"
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          data={genderOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Gender"
          placeholderStyle={{color: 'grey'}}
          value={formData.gender}
          onChange={item => setFormData({...formData, gender: item.value})}
        />

        {formData.imageUri && (
          <Image source={{uri: formData.imageUri}} style={styles.image} />
        )}
        <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
          <Text style={styles.buttonText}>Upload Profile Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, {width: '100%'}]}
          onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
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
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 15,
  },
  nextButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#34495e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
});

export default Step1;

