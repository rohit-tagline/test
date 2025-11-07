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
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Dropdown} from 'react-native-element-dropdown';
import {MultiSelect} from 'react-native-element-dropdown';
import {updateStep3} from '../../store/formSlice';

const Step3 = ({next, prev}) => {
  const dispatch = useDispatch();
  const step3 = useSelector(state => state.form.step3);
  const [formData, setFormData] = useState({
    institution: step3.institution || '',
    degree: step3.degree || 'BE',
    field: step3.field || '',
    graduationYear: step3.graduationYear || '',
    cgpa: step3.cgpa || '',
    hobbies: step3.hobbies || [],
  });

  const universityData = [
    {label: 'GTU - Gujarat Technological University', value: 'GTU'},
    {label: 'Nirma University', value: 'Nirma'},
    {label: 'IIT Bombay', value: 'IIT Bombay'},
    {label: 'IIT Delhi', value: 'IIT Delhi'},
    {label: 'IIT Madras', value: 'IIT Madras'},
    {label: 'IIT Kharagpur', value: 'IIT Kharagpur'},
    {label: 'BITS Pilani', value: 'BITS Pilani'},
    {label: 'VIT Vellore', value: 'VIT Vellore'},
    {label: 'SRM University', value: 'SRM University'},
    {label: 'Pune University', value: 'Pune University'},
  ];

  const fieldData = [
    {label: 'Computer Engineering', value: 'Computer Engineering'},
    {label: 'Mechanical Engineering', value: 'Mechanical Engineering'},
    {label: 'Electrical Engineering', value: 'Electrical Engineering'},
    {
      label: 'Electronics & Communication',
      value: 'Electronics & Communication',
    },
    {label: 'Civil Engineering', value: 'Civil Engineering'},
    {label: 'Information Technology', value: 'Information Technology'},
  ];

  const yearData = Array.from({length: 26}, (_, i) => ({
    label: (2000 + i).toString(),
    value: (2000 + i).toString(),
  }));

  const hobbiesData = [
    {label: 'Reading', value: 'Reading'},
    {label: 'Cooking', value: 'Cooking'},
    {label: 'Playing Sports', value: 'Playing Sports'},
    {label: 'Singing', value: 'Singing'},
    {label: 'Dancing', value: 'Dancing'},
    {label: 'Photography', value: 'Photography'},
    {label: 'Traveling', value: 'Traveling'},
    {label: 'Painting', value: 'Painting'},
    {label: 'Gardening', value: 'Gardening'},
    {label: 'Gaming', value: 'Gaming'},
    {label: 'Writing', value: 'Writing'},
    {label: 'Yoga', value: 'Yoga'},
  ];

  const handleNext = () => {
    if (
      !formData.institution ||
      !formData.degree ||
      !formData.field ||
      !formData.graduationYear ||
      formData.cgpa === '' ||
      formData.hobbies.length < 1
    ) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    const cgpa = parseFloat(formData.cgpa);
    if (isNaN(cgpa)) {
      Alert.alert('Error', 'Please enter a valid CGPA');
      return;
    }

    if (cgpa < 0 || cgpa > 10) {
      Alert.alert('Error', 'CGPA must be between 0 and 10');
      return;
    }

    dispatch(updateStep3(formData));
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
        <Text style={styles.heading}>Education Details</Text>

        <Dropdown
          showsVerticalScrollIndicator={false}
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          data={universityData}
          search
          activeColor="white"
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select University"
          searchPlaceholder="Search University Name"
          value={formData.institution}
          onChange={item => {
            setFormData({...formData, institution: item.value});
          }}
        />

        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>Degree :</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setFormData({...formData, degree: 'BE'})}>
              {formData.degree === 'BE' ? (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/2704/2704832.png',
                  }}
                  style={styles.radioIcon}
                />
              ) : (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/10496/10496919.png',
                  }}
                  style={styles.radioIcon}
                />
              )}
              <Text style={styles.radioText}>BE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => setFormData({...formData, degree: 'ME'})}>
              {formData.degree === 'ME' ? (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/2704/2704832.png',
                  }}
                  style={styles.radioIcon}
                />
              ) : (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/10496/10496919.png',
                  }}
                  style={styles.radioIcon}
                />
              )}
              <Text style={styles.radioText}>ME</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Dropdown
          showsVerticalScrollIndicator={false}
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          data={fieldData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Field of Study"
          searchPlaceholder="Search Field of Study"
          activeColor="white"
          value={formData.field}
          onChange={item => {
            setFormData({...formData, field: item.value});
          }}
        />

        <Dropdown
          showsVerticalScrollIndicator={false}
          flatListProps={{bounces: false}}
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          data={yearData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Graduation Year"
          activeColor="white"
          value={formData.graduationYear}
          onChange={item => {
            setFormData({...formData, graduationYear: item.value});
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="CGPA (0-10)"
          keyboardType="numeric"
          placeholderTextColor={'grey'}
          value={formData.cgpa}
          onChangeText={t => setFormData({...formData, cgpa: t})}
          maxLength={4}
        />

        <Text style={styles.multiSelectLabel}>Hobbies:</Text>
        <MultiSelect
          showsVerticalScrollIndicator={false}
          flatListProps={{bounces: false}}
          data={hobbiesData}
          labelField="label"
          valueField="value"
          style={styles.dropdown}
          searchField="label"
          activeColor="white"
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          placeholder={
            formData.hobbies.length === 0
              ? 'Select hobbies'
              : `${formData.hobbies.length} selected`
          }
          value={formData.hobbies}
          onChange={items => {
            setFormData({...formData, hobbies: items});
          }}
          renderRightIcon={() => (
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/137/137621.png',
              }}
              style={styles.icon}
            />
          )}
          renderItem={(item, selected) => (
            <View
              style={[
                styles.dropdownItem,
                selected ? styles.selectedItem : null,
              ]}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {selected && (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/5290/5290058.png',
                  }}
                  style={styles.tickIcon}
                />
              )}
            </View>
          )}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.prevButton} onPress={prev}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!formData.institution ||
                !formData.cgpa ||
                formData.hobbies.length === 0 ||
                !formData.field ||
                !formData.graduationYear) &&
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
    paddingBottom: 100,
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
  placeholderStyle: {
    fontSize: 16,
    color: 'grey',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  radioContainer: {
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 18,
    marginBottom: 8,
    color: 'black',
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    marginLeft: 8,
    fontSize: 16,
  },
  radioIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  multiSelectLabel: {
    fontSize: 18,
    marginBottom: 8,
    color: 'black',
    fontWeight: '600',
  },
  icon: {
    width: 20,
    height: 20,
  },
  dropdownItem: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: 'white',
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
  },
  tickIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
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

export default Step3;

