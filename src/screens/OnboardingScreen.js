import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    title: 'Welcome!',
    description: 'Enjoy a clean, light theme and smooth animations.',
    lottie: require('../assets/lottie/ak1.json'),   
    bg: '#fff',
  },
  {
    title: 'Explore Features',
    description: 'Analytics, Crashlytics, Remote Config and more.',
    lottie: require('../assets/lottie/ak2.json'),
    bg: '#E8F5E9',
  },
  {
    title: 'Localization',
    description: 'Switch languages instantly with Google Sheets.',
    lottie: require('../assets/lottie/ak3.json'),
    bg: '#fff4e3',
  },
  {
    title: 'Ready to Go!',
    description: 'Tap Get Started and dive in.',
    lottie: require('../assets/lottie/ak6.json'),
    bg: '#F3E5F5',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef(null);

  const goNext = () => {
    if (index < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    navigation.replace('MainScreen');   // your home screen
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.bg }]}>
      <LottieView source={item.lottie} autoPlay loop style={styles.lottie} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </View>
  );

  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 20, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            style={[styles.dot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={e => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIdx);
        }}
        keyExtractor={(_, i) => i.toString()}
      />

      <Pagination />

      <TouchableOpacity style={styles.btn} onPress={goNext}>
        <Text style={styles.btnText}>
          {index === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  lottie: { width:220, height:220 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 24, color: '#222' },
  desc: { fontSize: 16, textAlign: 'center', marginTop: 12, color: '#555' },
  pagination: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 6,
  },
  btn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});