import React, { useMemo, useState } from 'react';
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

const loginSchema = yup.object().shape({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const MapboxLoginScreen = ({ navigation }) => {
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
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async formValues => {
      setErrorMessage('');
      try {
        const credential = await auth().signInWithEmailAndPassword(
          formValues.email.trim(),
          formValues.password,
        );
        const token = await credential.user.getIdToken();
        setAuthData({
          accessToken: token,
          userId: credential.user.uid,
          profile: {
            email: credential.user.email,
            name: credential.user.displayName,
          },
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'MapboxTabs' }],
        });
      } catch (error) {
        setErrorMessage(error?.message ?? 'Unable to sign in. Please try again.');
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
              <Text style={styles.kicker}>Welcome back</Text>
              <Text style={styles.title}>Sign in to continue</Text>
              <Text style={styles.subtitle}>
                Access your saved rides and resume tracking in seconds.
              </Text>
            </View>

            <View style={styles.card}>
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

              {errorMessage ? <Text style={styles.serverError}>{errorMessage}</Text> : null}

              <MapboxPrimaryButton title="Login" onPress={handleSubmit} loading={isSubmitting} />

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Need an account?</Text>
                <TouchableOpacity onPress={() => navigation.replace('MapboxSignup')}>
                  <Text style={styles.linkText}>Create one</Text>
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

export default MapboxLoginScreen;

