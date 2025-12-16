import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { GradientBackground, screenStyles } from '../../styles/layout';
import Colors from '../../styles/colors';
import { fontSizes } from '../../styles/typography';
import MapboxPrimaryButton from '../../components/MapboxPrimaryButton';
import useUserStore from '../../zustandstore/userStore';
import LottieView from 'lottie-react-native';

const MapboxOnboardingScreen = ({ navigation }) => {
  const setHasSeenOnboarding = useUserStore(state => state.setHasSeenOnboarding);

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    navigation.replace('MapboxLogin');
  };

  return (
    <GradientBackground style={screenStyles.safeArea}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={screenStyles.container}>
        <View style={styles.heroContainer}>
          <Text style={styles.kicker}>Powered by Mapbox</Text>
          <Text style={styles.title}>Navigate your ride with style</Text>
          <Text style={styles.subtitle}>
            Track live trips, store history, and manage your sessions securely with our new purple
            nebula experience.
          </Text>
          <View style={styles.illustration} >
          <LottieView source={require("../../assets/lottie/ak10.json")} autoPlay loop speed={1} style={{width:"100%", height:"100%"}}/>
          </View>
        </View>
        <View style={styles.ctaContainer}>
          <MapboxPrimaryButton title="Get Started" onPress={handleGetStarted} />
          <Text style={styles.hintText}>Already have an account? Log in to continue.</Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  heroContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  kicker: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: fontSizes.hero,
    marginTop: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: fontSizes.md,
    marginTop: 16,
  },
  illustration: {
    width: wp(70),
    height: hp(28),
    alignSelf: 'center',
    marginTop: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputFill,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  hintText: {
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default MapboxOnboardingScreen;

