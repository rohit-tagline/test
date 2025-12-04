import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import { SafeAreaView } from 'react-native-safe-area-context';
// import {LoginManager, AccessToken} from 'react-native-fbsdk-next';


if (Platform.OS === 'android') {
  GoogleSignin.configure({
    webClientId:
      '776795403659-8pg6nb5k19vf3ka13ec7pu1ca8s2k79o.apps.googleusercontent.com',// Replace with your Android web client ID
  });
} else if (Platform.OS === 'ios') {
  GoogleSignin.configure({
    webClientId:
      '776795403659-uc0t3b2e85pj87jiq4qhtf4ncnk4kscu.apps.googleusercontent.com', // Replace with your iOS web client ID
  });
}

const FirebaseLoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleloading, setgoogleLoading] = useState(false);
  const [facebookloading, setfacebookLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const getGoogleErrorMessage = (err) => {
    const code = String(err?.code ?? '').trim();
    // Map common Google Sign-In error codes to human-friendly tips
    switch (code) {
      case '10':
        return 'DEVELOPER_ERROR (10): SHA-1/SHA-256 mismatch. Add your app\'s SHA-1 and SHA-256 to Firebase → Project Settings → Android app, then download a new google-services.json and rebuild.';
      case '7':
        return 'NETWORK_ERROR (7): Check device network connection or try again.';
      case '12500':
      case '12501':
        return 'CANCELED: The sign-in flow was canceled. Please try again.';
      case '12502':
        return 'ALREADY_IN_PROGRESS: Another sign-in is in progress. Wait and retry.';
      case '16':
        return 'API_UNAVAILABLE (16): Google Play Services API unavailable. Update Google Play services and try again.';
      case 'auth/invalid-credential':
        return 'Invalid Firebase credential. Ensure the ID token is valid and the webClientId is correct.';
      case 'auth/account-exists-with-different-credential':
        return 'This email already exists with a different sign-in method. Use that method or link accounts.';
      default:
        return `${code || 'UNKNOWN'}: ${err?.message || 'Google login failed.'}`;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        // Check if email is verified before considering user logged in
        console.log(user);
        if (user.emailVerified) {
          console.log('User logged in with verified email:', user);
          setUserData(user);
        } else {
          if (
            user.providerData.length > 0 &&
            user.providerData[0].providerId === 'facebook.com'
          ) {
            setUserData(user);
            console.log('facebook login happening');
            console.log(user);
          } else if (
            user.providerData.length > 0 &&
            user.providerData[0].providerId === 'google.com'
          ) {
            setUserData(user);
            console.log('Google login happening');
            console.log(user);
          } else {
            console.log('User email not verified');
            // ToastAndroid.show("User email not verified", ToastAndroid.SHORT);
            Alert.alert('Error', 'User email not verified');
            auth().signOut();
            GoogleSignin.signOut();
            // LoginManager.logOut(); // Facebook login disabled
          }
        }
      } else {
        console.log('No user logged in');
        setUserData(null);
      }
      setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ff8400" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      // ToastAndroid.show('Please fill all fields', ToastAndroid.SHORT);
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // await auth().signOut();
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in. Check your inbox for the verification email.',
          [
            {
              text: 'Resend Verification',
              onPress: async () => {
                try {
                  await userCredential.user.sendEmailVerification();
                  // ToastAndroid.show('Verification email resent!', ToastAndroid.SHORT);
                  Alert.alert('Success', 'Verification email resent!');
                } catch (error) {
                  // ToastAndroid.show(error.message, ToastAndroid.SHORT);
                  Alert.alert('Error', error.message);
                }
              },
            },
            {text: 'OK'},
          ],
        );
        return;
      }
      console.log('Email login successful:', userCredential.user);
      // ToastAndroid.show('Login successful', ToastAndroid.SHORT);
      Alert.alert('Success', 'Login successful');

      setUserData(userCredential.user);
    } catch (err) {
      console.log('Email login error:', err);
      // ToastAndroid.show('Login Failed', ToastAndroid.SHORT);
      Alert.alert('Error', 'Login Failed');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      // Check if your device supports Google Play
      setgoogleLoading(true);
      await GoogleSignin.signOut();

      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Get the users ID token
      const userData = await GoogleSignin.signIn();
      console.log('Google ID token:', userData.data.idToken);

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(
        userData.data.idToken,
      );

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      setgoogleLoading(false);
      console.log('Google login successful:', userCredential.user);
      // ToastAndroid.show('Google login successful', ToastAndroid.SHORT);

      setUserData(userCredential.user);
    } catch (error) {
      console.log('Google login error:', error);
      const message = getGoogleErrorMessage(error);
      Alert.alert('Google Login Error', message);
      setError(message);
    } finally {
      setgoogleLoading(false);
    }
  };

  // const onFacebookButtonPress = async () => {
  //   // Facebook login disabled
  // };

  const handleForgotPassword = async () => {
    if (!email) {
      // ToastAndroid.show('Please enter your email address', ToastAndroid.SHORT);
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      // ToastAndroid.show('Password reset email sent! Check your inbox', ToastAndroid.SHORT);
      Alert.alert('Success', 'Password reset email sent! Check your inbox');
    } catch (error) {
      console.log('Password reset error:', error);
      // ToastAndroid.show(error.message, ToastAndroid.SHORT);
      Alert.alert('Success', 'Password reset email sent! Check your inbox');
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      // await LoginManager.logOut(); // Facebook login disabled
      console.log('User signed out');
      // ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
      Alert.alert('Success', 'Logged out successfully');
      setUserData(null);
      setEmail(null);
      setPassword(null);
    } catch (error) {
      console.log('Logout error:', error);
      // Alert.alert('Logout Error', error.message);
      Alert.alert('Error', error.message);
    }
  };

  // If user is already logged in, show their data
  if (userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Welcome,{' '}
          {userData.providerData[0].displayName ||
            userData.providerData[0].email}
          !
        </Text>
        <Image
          source={{
            uri:
              userData.providerData[0].photoURL ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp3oYa9BljpcyhfIwVizBrEuo4HjsWq1mNzw&s',
          }}
          style={styles.profileImage}
        />
        <View style={styles.userDataContainer}>
          <Text ellipsizeMode="tail" style={styles.userDataText}>
            Name : {userData.providerData[0].displayName}
          </Text>
          <Text style={styles.userDataText}>
            Email: {userData.providerData[0].email}
          </Text>
          {/* <Text style={styles.userDataText}>Provider: {userData.providerData[0].providerId}</Text> */}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show login screen if user is not logged in
  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
    <ScrollView bounces={false} contentContainerStyle={{ justifyContent: 'center' ,flexGrow :1}} showsVerticalScrollIndicator={false}>
      <View style={styles.innerContainer}>
        {/* Top image replacing lottie */}
        <Image source={{uri: 'https://cdn-icons-png.flaticon.com/128/17502/17502159.png'}} style={{height: 150, width: 150, alignSelf: 'center', borderRadius: 12}} />
        <Text style={styles.title}>Login</Text>

        {/* {error ? <Text style={styles.error}>{error}</Text> : null} */}
        {loading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              width: 100,
              alignSelf: 'center',
              height: 100,
            }}
            size={'large'}
            color={'#ff8400'}
          />
        )}
        {googleloading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              width: 100,
              alignSelf: 'center',
              height: 100,
            }}
            size={'large'}
            color={'#ff8400'}
          />
        )}
        {facebookloading && (
          <ActivityIndicator
            style={{
              position: 'absolute',
              width: 100,
              alignSelf: 'center',
              height: 100,
            }}
            size={'large'}
            color={'#ff8400'}
          />
        )}

        <View style={styles.inputContainer}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/482/482138.png',
            }}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onSubmitEditing={() => passwordRef.current.focus()}
            returnKeyType="next"
            submitBehavior="submit"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/13645/13645760.png',
            }}
            style={styles.inputIcon}
          />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            submitBehavior="blurAndSubmit"
            maxLength={12}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/561/561226.png',
            }}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login with Email'}
          </Text>
        </TouchableOpacity>

        <View style={{flexDirection:'row',paddingTop:15,alignItems:'center',justifyContent:'center'}}>
        <View style={{width:"35%",borderBottomWidth:1.5,height:0,borderColor:'grey'}}></View>
          <Text style={{marginHorizontal:5,color:'grey',fontWeight:'500'}}>or continue with</Text>
          <View style={{width:"35%",borderBottomWidth:1.5,height:0,borderColor:'grey'}}></View>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          style={[styles.facebookButton, loading && styles.buttonDisabled]}
          onPress={onGoogleButtonPress}
          disabled={loading}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/720/720255.png',
            }}
            style={styles.buttonIcon}
          />
          <Text style={styles.facebookButtonText}>Login with Google</Text>
        </TouchableOpacity>

        {/* Facebook Login Button disabled */}
        {/* <TouchableOpacity
          style={[styles.facebookButton, loading && styles.buttonDisabled]}
          onPress={onFacebookButtonPress}
          disabled={loading}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/128/5968/5968764.png' }}
            style={styles.buttonIcon}
          />
          <Text style={styles.facebookButtonText}>Login with Facebook</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => navigation.replace('FirebaseSignUpScreen')}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView >
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
    backgroundColor: 'grey',
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 25,
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#555',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00BBFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    width: '100%',
    height: 48,
    marginTop: 20,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    marginLeft: 10,
  },
  facebookButton: {
    backgroundColor: '#00BBFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 30,
    alignSelf: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupBold: {
    fontWeight: 'bold',
    color: '#4285F4',
  },
  error: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  userDataContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  userDataText: {
    fontSize: 16,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: '#4285F4',
    fontSize: 14,
  },
  verificationNotice: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  verificationText: {
    color: '#E65100',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  resendLink: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default FirebaseLoginScreen;