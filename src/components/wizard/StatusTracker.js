import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const steps = [
  {
    id: 1,
    label: 'Personal',
    icon: 'https://cdn-icons-png.flaticon.com/128/10628/10628940.png',
  },
  {
    id: 2,
    label: 'Address',
    icon: 'https://cdn-icons-png.flaticon.com/128/12672/12672462.png',
  },
  {
    id: 3,
    label: 'Education',
    icon: 'https://cdn-icons-png.flaticon.com/128/15759/15759125.png',
  },
  {
    id: 4,
    label: 'Experience',
    icon: 'https://cdn-icons-png.flaticon.com/128/5681/5681243.png',
  },
];

const StatusTracker = ({currentStep}) => {
  if (currentStep === 5) {
    return null;
  }

  return (
    <View style={styles.trackercontainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                index < currentStep ? styles.activeCircle : styles.inactiveCircle,
              ]}>
              {index < currentStep && (
                <Image source={{uri: step.icon}} style={styles.trackericon} />
              )}
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.line,
                index < currentStep - 1
                  ? styles.activeLine
                  : styles.inactiveLine,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  trackercontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#4CAF50',
  },
  inactiveCircle: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  trackericon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  stepLabel: {
    marginTop: 5,
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  line: {
    height: 4,
    width: 50,
  },
  activeLine: {
    backgroundColor: '#4CAF50',
  },
  inactiveLine: {
    backgroundColor: '#ccc',
  },
});

export default StatusTracker;

