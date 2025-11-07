import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import {useSelector} from 'react-redux';
import {resetForm} from '../../store/formSlice';
import {useDispatch} from 'react-redux';
import {updatecurrentstep} from '../../store/formSlice';

const FinalStep = ({resetForm: handleResetProp}) => {
  const dispatch = useDispatch();
  const step1Data = useSelector(state => state.form.step1);
  const step2Data = useSelector(state => state.form.step2);
  const step3Data = useSelector(state => state.form.step3);
  const step4Data = useSelector(state => state.form.step4);

  const handleReset = () => {
    if (handleResetProp) {
      handleResetProp();
    } else {
      dispatch(resetForm());
      dispatch(updatecurrentstep(1));
    }
  };

  const formatValue = (key, value) => {
    if (value === null || value === '' || value === undefined)
      return 'Not provided';

    if (key === 'dob' || key === 'startDate' || key === 'endDate') {
      return new Date(value).toLocaleDateString();
    }

    if (key === 'hobbies' && Array.isArray(value)) {
      return value.join(', ');
    }

    if (key === 'expectedSalary') {
      return `${value} LPA`;
    }

    return value.toString();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Review Your Information</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

          {step1Data.imageUri && (
            <View style={styles.imageField}>
              <Image
                source={{uri: step1Data.imageUri}}
                style={styles.reviewImage}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>First Name:</Text>
            <Text style={styles.value}>
              {formatValue('firstName', step1Data.firstName)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Last Name:</Text>
            <Text style={styles.value}>
              {formatValue('lastName', step1Data.lastName)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {formatValue('email', step1Data.email)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>
              {formatValue('phone', step1Data.phone)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>
              {formatValue('gender', step1Data.gender)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>
              {formatValue('dob', step1Data.dob)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ADDRESS INFORMATION</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {formatValue('address', step2Data.address)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>City:</Text>
            <Text style={styles.value}>
              {formatValue('city', step2Data.city)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>State:</Text>
            <Text style={styles.value}>
              {formatValue('state', step2Data.state)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Country:</Text>
            <Text style={styles.value}>
              {formatValue('country', step2Data.country)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Zip Code:</Text>
            <Text style={styles.value}>
              {formatValue('zipCode', step2Data.zipCode)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EDUCATION INFORMATION</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Institution:</Text>
            <Text style={styles.value}>
              {formatValue('institution', step3Data.institution)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Degree:</Text>
            <Text style={styles.value}>
              {formatValue('degree', step3Data.degree)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Field of Study:</Text>
            <Text style={styles.value}>
              {formatValue('field', step3Data.field)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Graduation Year:</Text>
            <Text style={styles.value}>
              {formatValue('graduationYear', step3Data.graduationYear)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CGPA:</Text>
            <Text style={styles.value}>
              {formatValue('cgpa', step3Data.cgpa)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Hobbies:</Text>
            <Text style={styles.value}>
              {formatValue('hobbies', step3Data.hobbies)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>
              {formatValue('company', step4Data.company)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Position:</Text>
            <Text style={styles.value}>
              {formatValue('position', step4Data.position)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>
              {formatValue('startDate', step4Data.startDate)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>End Date:</Text>
            <Text style={styles.value}>
              {formatValue('endDate', step4Data.endDate)}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Expected Salary:</Text>
            <Text style={styles.value}>
              {formatValue('expectedSalary', step4Data.expectedSalary)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.buttonText}>Start Over</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#7f8c8d',
    flex: 1,
  },
  value: {
    flex: 2,
    color: '#2c3e50',
  },
  reviewImage: {
    width: 110,
    height: 110,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FinalStep;

