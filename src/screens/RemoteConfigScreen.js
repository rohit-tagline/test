import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Switch } from 'react-native';
import remoteConfig from '@react-native-firebase/remote-config';

const INITIAL_CONFIG = {
  welcomeMessage: 'Welcome! ',
  isDarkTheme: false,
  isFestival: false,
  showImage: false,
};

const RemoteConfigScreen = () => {
  const [loading, setLoading] = useState(false);
  const [configValues, setConfigValues] = useState(INITIAL_CONFIG);
  const [themeOverride, setThemeOverride] = useState(null); // null = follow remote, boolean = local override

  useEffect(() => {
    // Simple demo: fetch once on mount (default caching behavior)
    fetchAndActivate();
  }, []);

  const fetchAndActivate = async () => {
    try {
      setLoading(true);
      // Ensure remote values take effect by clearing local override
      setThemeOverride(null);
      // Force fresh fetch (no cache) so latest Firebase selections are applied
      await remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 0 });
      await remoteConfig().fetchAndActivate();
      setConfigValues({
        welcomeMessage: remoteConfig().getValue('welcomeMessage').asString() || 'Welcome!',
        isDarkTheme: remoteConfig().getValue('isDarkTheme').asBoolean(),
        isFestival: remoteConfig().getValue('isFestival').asBoolean(),
        showImage: remoteConfig().getValue('showImage').asBoolean(),
      });
    } catch (error) {
      console.error('Remote Config fetch error:', error);
      Alert.alert('Error', `Failed to fetch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAndForceFetch = async () => {
    // Reset to initial defaults and clear any local theme override.
    setThemeOverride(null);
    setConfigValues(INITIAL_CONFIG);
    Alert.alert('Reset', 'Defaults restored. Tap Fetch to apply latest Remote Config.');
  };

  const isDark = (themeOverride === null ? configValues.isDarkTheme : themeOverride) === true;
  const themeStyles = isDark ? darkTheme : lightTheme;

  return (
    <ScrollView style={[styles.container, themeStyles.container]} contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, themeStyles.text]}>Remote Config Demo</Text>
      <Text style={[styles.subtitle, themeStyles.textSecondary]}>Theme, Festival and Image toggles</Text>

      {configValues.isFestival && (
        <View style={[styles.festivalBanner, themeStyles.festivalBanner]}>
          <Text style={styles.festivalText}>🎉 Happy Diwali! 🎆</Text>
        </View>
      )}

      <View style={[styles.card, themeStyles.card]}> 
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, themeStyles.text]}>Theme</Text>
          <View style={styles.rowCenter}>
            <Text style={[styles.switchLabel, themeStyles.textSecondary]}>Light</Text>
            <Switch
              value={isDark}
              onValueChange={(val) => setThemeOverride(val)}
            />
            <Text style={[styles.switchLabel, themeStyles.textSecondary]}>Dark</Text>
          </View>
        </View>
        <Text style={[styles.cardValue, themeStyles.text]}>Remote isDarkTheme: {String(configValues.isDarkTheme)}</Text>
        <Text style={[styles.cardValue, themeStyles.text]}>Using: {themeOverride === null ? 'Remote value' : 'Local override'}</Text>
      </View>

      <View style={[styles.card, themeStyles.card]}>
        <Text style={[styles.cardTitle, themeStyles.text]}>Welcome Message</Text>
        <Text style={[styles.cardValue, themeStyles.text]}>{configValues.welcomeMessage}</Text>
      </View>

      {configValues.showImage && (
        <View style={[styles.card, themeStyles.card]}>
          <Text style={[styles.cardTitle, themeStyles.text]}>Promo Image</Text>
          <Image
            source={{ uri: 'https://picsum.photos/seed/remote-config/400/200' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={fetchAndActivate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Fetch Remote Config</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={resetAndForceFetch} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset theme</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.infoContainer, themeStyles.info]}>
        <Text style={[styles.infoTitle, themeStyles.text]}>Expected Remote Config Keys</Text>
        <Text style={[styles.infoText, themeStyles.textSecondary]}>
          • welcomeMessage (String){"\n"}
          • isDarkTheme (Boolean){"\n"}
          • isFestival (Boolean){"\n"}
          • showImage (Boolean)
        </Text>
        <Text style={[styles.infoText, themeStyles.textSecondary, { marginTop: 8 }]}>
          Note: Changing the switch only affects the app theme locally. To change Remote Config values on the server,
          update them in Firebase Console (then press Fetch) or via a backend using the Firebase Admin SDK.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#ddd',
  },
  festivalBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  festivalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

const lightTheme = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  text: {
    color: '#333',
  },
  textSecondary: {
    color: '#666',
  },
  card: {
    backgroundColor: '#f5f5f5',
  },
  info: {
    backgroundColor: '#e3f2fd',
  },
  festivalBanner: {
    backgroundColor: '#d81b60',
  },
});

const darkTheme = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  text: {
    color: '#e0e0e0',
  },
  textSecondary: {
    color: '#bdbdbd',
  },
  card: {
    backgroundColor: '#1e1e1e',
  },
  info: {
    backgroundColor: '#1a237e',
  },
  festivalBanner: {
    backgroundColor: '#8e24aa',
  },
});

export default RemoteConfigScreen;

