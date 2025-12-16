import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useFormik } from 'formik';
import * as yup from 'yup';
import auth from '@react-native-firebase/auth';
import { GradientBackground, screenStyles } from '../../styles/layout';
import Colors from '../../styles/colors';
import MapboxTextInput from '../../components/MapboxTextInput';
import MapboxPrimaryButton from '../../components/MapboxPrimaryButton';
import { fontSizes } from '../../styles/typography';
import useUserStore from '../../zustandstore/userStore';

const signupSchema = yup.object().shape({
  fullName: yup
    .string()
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters')
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Include at least one uppercase letter')
    .matches(/[0-9]/, 'Include at least one number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const MapboxSignupScreen = ({ navigation }) => {
  const setAuthData = useUserStore(state => state.setAuthData);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleChange,
    handleSubmit,
    values,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    validationSchema: signupSchema,
    onSubmit: async formValues => {
      setErrorMessage('');
      try {
        const credential = await auth().createUserWithEmailAndPassword(
          formValues.email.trim(),
          formValues.password,
        );
        await credential.user.updateProfile({ displayName: formValues.fullName });
        const token = await credential.user.getIdToken();
        setAuthData({
          accessToken: token,
          userId: credential.user.uid,
          profile: {
            email: credential.user.email,
            name: formValues.fullName,
          },
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'MapboxTabs' }],
        });
      } catch (error) {
        setErrorMessage(error?.message ?? 'Unable to create account right now.');
      }
    },
  });

  return (
    <GradientBackground style={screenStyles.safeArea}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={screenStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={screenStyles.container}
        >
          <ScrollView contentContainerStyle={[screenStyles.content, styles.scrollContent]}>
            <View style={styles.header}>
              <Text style={styles.kicker}>Create account</Text>
              <Text style={styles.title}>Welcome to the Mapbox club</Text>
              <Text style={styles.subtitle}>
                Securely store your sessions and unlock all navigation tools.
              </Text>
            </View>

            <View style={styles.card}>
              <MapboxTextInput
                label="Full Name"
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                error={touched.fullName && errors.fullName ? errors.fullName : ''}
              />
              <MapboxTextInput
                label="Email"
                value={values.email}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={handleChange('email')}
                error={touched.email && errors.email ? errors.email : ''}
              />
              <MapboxTextInput
                label="Password"
                value={values.password}
                secureTextEntry
                onChangeText={handleChange('password')}
                error={touched.password && errors.password ? errors.password : ''}
              />
              <MapboxTextInput
                label="Confirm Password"
                value={values.confirmPassword}
                secureTextEntry
                onChangeText={handleChange('confirmPassword')}
                error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''}
              />

              {errorMessage ? <Text style={styles.serverError}>{errorMessage}</Text> : null}

              <MapboxPrimaryButton title="Create Account" onPress={handleSubmit} loading={isSubmitting} />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.replace('MapboxLogin')}>
                  <Text style={styles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 32,
  },
  kicker: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: fontSizes.xl,
    marginTop: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
  },
  serverError: {
    color: Colors.danger,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: Colors.textSecondary,
    marginRight: 6,
  },
  linkText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

export default MapboxSignupScreen;

