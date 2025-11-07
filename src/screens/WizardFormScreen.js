import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from '../store/store';
import {updatecurrentstep, resetForm} from '../store/formSlice';
import Step1 from '../components/wizard/Step1';
import Step2 from '../components/wizard/Step2';
import Step3 from '../components/wizard/Step3';
import Step4 from '../components/wizard/Step4';
import FinalStep from '../components/wizard/FinalStep';
import StatusTracker from '../components/wizard/StatusTracker';
import { SafeAreaView } from 'react-native-safe-area-context';

const MultiStepForm = () => {
  const currentStep = useSelector(state => state.form.currentstep);
  const dispatch = useDispatch();

  const nextStep = () => {
    dispatch(updatecurrentstep(currentStep + 1));
  };

  const prevStep = () => {
    dispatch(updatecurrentstep(currentStep - 1));
  };

  const handleReset = () => {
    dispatch(resetForm());
    dispatch(updatecurrentstep(1));
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'#f8f9fa'}}>
    <View style={styles.container}>
      <StatusTracker currentStep={currentStep} />
      {currentStep === 1 && <Step1 next={nextStep} />}
      {currentStep === 2 && <Step2 next={nextStep} prev={prevStep} />}
      {currentStep === 3 && <Step3 next={nextStep} prev={prevStep} />}
      {currentStep === 4 && <Step4 next={nextStep} prev={prevStep} />}
      {currentStep === 5 && <FinalStep resetForm={handleReset} />}
    </View>
    </SafeAreaView>
  );
};

const WizardFormScreen = () => (
  <Provider store={store}>
    <MultiStepForm />
  </Provider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
});

export default WizardFormScreen;

