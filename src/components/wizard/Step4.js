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
import {Calendar} from 'react-native-calendars';
import Slider from '@react-native-community/slider';
import {updateStep4} from '../../reduxstore/formSlice';

const Step4 = ({next, prev}) => {
  const dispatch = useDispatch();
  const step4 = useSelector(state => state.form.step4);

  const POSITIONS = [
    'React Native Developer',
    'Node.js Developer',
    'React Developer',
    'Fullstack Developer',
    'MERN Stack Developer',
  ];

  const [formData, setFormData] = useState({
    company: step4.company || '',
    position: step4.position || POSITIONS[0],
    startDate: step4.startDate || null,
    endDate: step4.endDate || null,
    expectedSalary: step4.expectedSalary || 3,
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [salaryProgress, setsalaryProgress] = useState(formData.expectedSalary);

  const handleSubmit = () => {
    if (!formData.company || !formData.startDate || !formData.endDate) {
      Alert.alert(
        'Error',
        'Company name and employment dates are required!',
      );
      return;
    }

    dispatch(updateStep4(formData));
    next();
  };

  const handleDayPress = day => {
    const {startDate, endDate} = formData;

    if (!startDate || (startDate && endDate)) {
      setFormData({
        ...formData,
        startDate: day.dateString,
        endDate: null,
      });
    } else if (!endDate) {
      const isBeforeStart = new Date(day.dateString) < new Date(startDate);
      setFormData({
        ...formData,
        startDate: isBeforeStart ? day.dateString : startDate,
        endDate: isBeforeStart ? startDate : day.dateString,
      });
    }
  };

  const getMarkedDates = () => {
    const {startDate, endDate} = formData;
    let markedDates = {};

    if (startDate) {
      markedDates[startDate] = {
        selected: true,
        startingDay: true,
        customStyles: {
          container: {
            backgroundColor: '#fc3845',
            borderRadius: 20,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    }

    if (endDate) {
      markedDates[endDate] = {
        selected: true,
        endingDay: true,
        color: '#3d5a80',
        textColor: 'white',
        customStyles: {
          container: {
            backgroundColor: '#fc3845',
            borderRadius: 20,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };

      if (startDate !== endDate) {
        let current = new Date(startDate);
        current.setDate(current.getDate() + 1);

        while (current < new Date(endDate)) {
          const dateStr = current.toISOString().split('T')[0];
          markedDates[dateStr] = {
            selected: true,
            color: '#98c1d9',
            textColor: 'white',
          };
          current.setDate(current.getDate() + 1);
        }
      }
    }

    return markedDates;
  };

  const formatDate = date => {
    if (!date) return 'Not selected';
    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    return new Date(date).toLocaleDateString(undefined, options);
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
        <Text style={styles.heading}>Work Experience</Text>

        <TextInput
          style={styles.input}
          placeholder="Company Name"
          placeholderTextColor={'grey'}
          value={formData.company}
          onChangeText={t => setFormData({...formData, company: t})}
        />

        <View style={styles.positionContainer}>
          <Text style={styles.sectionLabel}>Select Position:</Text>
          {POSITIONS.map(pos => (
            <TouchableOpacity
              key={pos}
              style={[
                styles.positionOption,
                formData.position === pos && styles.selectedPosition,
              ]}
              onPress={() => setFormData({...formData, position: pos})}>
              <Text style={styles.positionText}>{pos}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Employment Period:</Text>
          <TouchableOpacity
            style={styles.dateRangeButton}
            onPress={() => setShowCalendar(!showCalendar)}>
            <Text style={styles.dateText}>
              {formData.startDate
                ? formatDate(formData.startDate)
                : 'Select start date'}
            </Text>
            <Text style={styles.dateSeparator}>to</Text>
            <Text style={styles.dateText}>
              {formData.endDate
                ? formatDate(formData.endDate)
                : 'Select end date'}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                markingType="custom"
                markedDates={getMarkedDates()}
                onDayPress={handleDayPress}
                theme={{
                  calendarBackground: '#ffffff',
                  selectedDayBackgroundColor: '#3d5a80',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#ee6c4d',
                  arrowColor: '#3d5a80',
                  monthTextColor: '#3d5a80',
                  textDayFontWeight: '500',
                  textDisabledColor: '#d9d9d9',
                }}
              />
              <TouchableOpacity
                style={[styles.resetButton, {backgroundColor: '#3d5a80'}]}
                onPress={() => {
                  setFormData({
                    ...formData,
                    startDate: null,
                    endDate: null,
                  });
                }}>
                <Text style={styles.resetText}>Reset Dates</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>
            Expected Salary: ₹{salaryProgress} LPA
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            minimumTrackTintColor="#3d5a80"
            maximumTrackTintColor="#3d5a80"
            thumbTintColor="#3d5a80"
            step={0.5}
            value={salaryProgress}
            onSlidingComplete={value => {
              setsalaryProgress(value);
              setFormData({...formData, expectedSalary: value});
            }}
          />
          <View style={styles.salaryRange}>
            <Text style={styles.rangeText}>1 LPA</Text>
            <Text style={styles.rangeText}>10 LPA</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.prevButton} onPress={prev}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!formData.company ||
                !formData.startDate ||
                !formData.endDate) &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
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
    paddingBottom: 140,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  positionContainer: {
    marginBottom: 20,
  },
  positionOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedPosition: {
    borderColor: '#3d5a80',
    backgroundColor: '#eaf2f8',
  },
  positionText: {
    fontSize: 16,
  },
  dateRangeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2c3e50',
  },
  dateSeparator: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginVertical: 5,
  },
  calendarContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: 'white',
  },
  resetButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  resetText: {
    color: 'white',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 30,
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#ddd',
  },
  salaryRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  rangeText: {
    color: 'grey',
    fontSize: 14,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  prevButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#3d5a80',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Step4;

