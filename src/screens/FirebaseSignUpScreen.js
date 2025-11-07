import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const FirebaseSignUpScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const NAME_REGEX = /^[a-zA-Z ]+$/;
  const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)(?!.*\.$)([a-z0-9]+(?:\.[a-zA-Z0-9]+)*)@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError('Please fill all fields');
      ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      return;
    }
    if (!NAME_REGEX.test(name)) {
      ToastAndroid.show('Please enter valid name', ToastAndroid.SHORT);
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      ToastAndroid.show('Please enter valid email', ToastAndroid.SHORT);
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      ToastAndroid.show('Password should be at least 6 characters', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.sendEmailVerification();
      ToastAndroid.show('Verification email sent! Please verify your email before logging in', ToastAndroid.LONG);
      await userCredential.user.updateProfile({displayName: name});
      await auth().signOut();
      navigation.replace('FirebaseLoginScreen');
    } catch (err) {
      let errorMessage = 'Sign up failed. Please try again.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.'; break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is invalid.'; break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.'; break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.'; break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.'; break;
        default:
          errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, zIndex: 1}}>
      <View style={{flex: 1, padding: 0, justifyContent: 'flex-start', backgroundColor: 'white'}}>
        {/* Top banner image (replaces lottie) */}

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.innerContainer}>
            <Image
              source={{uri: 'https://img.freepik.com/premium-vector/sign-up-concept-illustration_114360-7965.jpg'}}
              resizeMode="cover"
              style={{ width: 170, height: 170,alignSelf:'center' }}
            />
            <Text style={styles.title}>Create Account</Text>
            {loading && (
              <ActivityIndicator style={{ position: 'absolute', width: 100, alignSelf: 'center', height: 100 }} size={'large'} color={'#ff8400'} />
            )}

            <View style={styles.inputContainer}>
              <Image source={{uri: 'https://cdn-icons-png.flaticon.com/128/126/126486.png'}} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                maxLength={30}
                cursorColor={'#ff8400'}
                onSubmitEditing={() => emailRef.current && emailRef.current.focus()}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>

            <View style={styles.inputContainer}>
              <Image source={{uri: 'https://cdn-icons-png.flaticon.com/128/482/482138.png'}} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                cursorColor={'#ff8400'}
                onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
                returnKeyType="next"
                submitBehavior="submit"
              />
            </View>

            <View style={styles.inputContainer}>
              <Image source={{uri: 'https://cdn-icons-png.flaticon.com/128/13645/13645760.png'}} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={12}
                cursorColor={'#ff8400'}
                submitBehavior="blurAndSubmit"
              />
            </View>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace('FirebaseLoginScreen')}>
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Login</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'absolute' },
  innerContainer: { padding: 30, zIndex: 50 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#333', textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 25, backgroundColor: 'white', borderRadius: 10 },
  inputIcon: { width: 24, height: 24, marginRight: 10, tintColor: '#555', marginLeft: 10 },
  input: { flex: 1, height: 40, color: '#333', fontSize: 16 },
  button: { backgroundColor: '#00BBFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonDisabled: { backgroundColor: '#9E9E9E' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 30, alignSelf: 'center' },
  loginText: { color: '#666', fontSize: 14 },
  loginBold: { fontWeight: 'bold', color: '#4285F4' },
  error: { color: 'red', marginBottom: 20, textAlign: 'center' },
});

export default FirebaseSignUpScreen;


