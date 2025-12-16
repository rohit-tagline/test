import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Colors from '../styles/colors';
import { fontSizes } from '../styles/typography';

const LocationPermissionModal = ({ visible, onClose, onOpenSettings }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Location permission needed</Text>
          <Text style={styles.body}>
            We need access to your location to track and show your routes correctly.
            Please enable location permission in your device settings.
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryLabel}>Not now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onOpenSettings}>
              <Text style={styles.primaryLabel}>
                {Platform.OS === 'ios' ? 'Open Settings' : 'Allow in Settings'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.card,
    padding: 24,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth:1,
    borderColor:Colors.gradientEnd
  },
  title: {
    color: Colors.textPrimary,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  secondaryLabel: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: Colors.success,
  },
  primaryLabel: {
    color: Colors.textPrimary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});

export default LocationPermissionModal;
