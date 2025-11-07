import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentstep: 1,
  step1: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    imageUri: '',
  },
  step2: {
    address: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
  },
  step3: {
    institution: '',
    degree: 'BE',
    field: '',
    graduationYear: '',
    cgpa: '',
    hobbies: [],
  },
  step4: {
    company: '',
    position: 'React Native Developer',
    startDate: null,
    endDate: null,
    expectedSalary: 3,
  },
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    updateStep1: (state, action) => {
      state.step1 = action.payload;
    },
    updateStep2: (state, action) => {
      state.step2 = action.payload;
    },
    updateStep3: (state, action) => {
      state.step3 = action.payload;
    },
    updateStep4: (state, action) => {
      state.step4 = action.payload;
    },
    updatecurrentstep: (state, action) => {
      state.currentstep = action.payload;
    },
    resetForm: (state) => {
      state.currentstep = 1;
      state.step1 = initialState.step1;
      state.step2 = initialState.step2;
      state.step3 = initialState.step3;
      state.step4 = initialState.step4;
    },
  },
});

export const {
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updatecurrentstep,
  resetForm,
} = formSlice.actions;

export default formSlice.reducer;

