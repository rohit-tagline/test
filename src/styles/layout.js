import { StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from './colors';

export const gradientProps = {
  colors: [Colors.backgroundDark, Colors.gradientStart, Colors.gradientEnd],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
  },
});

export const GradientBackground = props => (
  <LinearGradient {...gradientProps} {...props} />
);



