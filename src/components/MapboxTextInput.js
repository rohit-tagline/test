import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from '../styles/colors';
import { fontSizes } from '../styles/typography';

const MapboxTextInput = (
  { label, error, containerStyle, ...textInputProps },
  ref,
) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          ref={ref}
          placeholderTextColor={Colors.muted}
          style={styles.input}
          {...textInputProps}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputFill,
    borderRadius: 16,
    paddingHorizontal: wp(1),
    paddingVertical: 1,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: fontSizes.md,
  },
  errorText: {
    marginTop: 6,
    color: Colors.danger,
    fontSize: fontSizes.xs,
  },
  inputError: {
    borderColor: Colors.danger,
  },
});

export default forwardRef(MapboxTextInput);




