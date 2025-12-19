import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../styles/colors';
import { fontSizes } from '../styles/typography';

const MapboxPrimaryButton = ({ title, onPress, loading, disabled }) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={styles.container}
    >
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, isDisabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textPrimary} />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gradient: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  label: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default MapboxPrimaryButton;




