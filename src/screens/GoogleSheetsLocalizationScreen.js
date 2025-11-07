import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, I18nManager, DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import googleSheetsI18n from '../services/googleSheetsI18n';
import * as RNLocalize from 'react-native-localize';
import RNRestart from 'react-native-restart';


const SUPPORTED_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
];

const GoogleSheetsLocalizationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en');
  // Removed runtime refresh; offline-first using JSON files

  const systemLang = useMemo(() => {
    const locales = RNLocalize.getLocales();
    const code = (Array.isArray(locales) && locales[0]?.languageCode) || 'en';
    return SUPPORTED_LANGS.some(lang => lang.code === code) ? code : 'en';
  }, []);

  // Keep original behavior: rely on I18nManager for app-wide direction

  useEffect(() => {
    initializeTranslations();
    loadPersistedLanguage();
  }, []);

  const loadPersistedLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem('googleSheetsLanguage');
      if (stored && SUPPORTED_LANGS.some(lang => lang.code === stored)) {
        setSelectedLang(stored);
        await googleSheetsI18n.changeLanguage(stored);
      } else {
        // Use system language if no stored preference
        const locales = RNLocalize.getLocales();
        const systemLang = (Array.isArray(locales) && locales[0]?.languageCode) || 'en';
        const fallback = SUPPORTED_LANGS.some(lang => lang.code === systemLang) ? systemLang : 'en';
        setSelectedLang(fallback);
        await googleSheetsI18n.changeLanguage(fallback);
        await AsyncStorage.setItem('googleSheetsLanguage', fallback);
      }
    } catch (error) {
      console.error('Failed to load persisted language:', error);
    }
  };

  const initializeTranslations = async () => {
    setLoading(true);
    const success = await googleSheetsI18n.loadTranslations();
    if (success) {
      const currentLang = googleSheetsI18n.getCurrentLanguage();
      setSelectedLang(currentLang);
    } else {
      Alert.alert('Error', 'Failed to load translations from JSON files. Run "npm run syncTranslation" to generate them.');
    }
    setLoading(false);
  };

  // No in-app refresh; use npm run syncTranslation to update JSON files

  const handleLanguageChange = useCallback(async (langCode) => {
    try {
      setSelectedLang(langCode);
      await googleSheetsI18n.changeLanguage(langCode);
      await AsyncStorage.setItem('googleSheetsLanguage', langCode);
      
      // Handle RTL for Arabic
      const shouldBeRTL = langCode === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(shouldBeRTL);
        try {
          // DevSettings.reload();
          RNRestart.restart();
        } catch (_) {
          Alert.alert('Restart Required', 'Please restart the app to apply layout direction.');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, []);

  const setSystemDefault = useCallback(async () => {
    await AsyncStorage.setItem('googleSheetsLanguage', 'system');
    await handleLanguageChange(systemLang);
  }, [handleLanguageChange, systemLang]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading translations from Google Sheets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{googleSheetsI18n.t('title')}</Text>
        <Text style={styles.description}>{googleSheetsI18n.t('description')}</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>{googleSheetsI18n.t('chooseLanguage')}</Text>
        
        <View style={styles.langContainer}>
          {SUPPORTED_LANGS.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langButton,
                selectedLang === lang.code && styles.langButtonActive
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={[
                styles.langButtonText,
                selectedLang === lang.code && styles.langButtonTextActive
              ]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.systemInfoContainer}>
          <Text style={styles.meta}>System language: <Text style={styles.metaBold}>{systemLang}</Text></Text>
        </View>

        <TouchableOpacity style={styles.systemBtn} onPress={setSystemDefault}>
          <Text style={styles.systemBtnText}>{googleSheetsI18n.t('systemDefault')}</Text>
        </TouchableOpacity>

        <View style={styles.sampleCard}>
          <Text style={styles.cardTitle}>Preview</Text>
          <Text style={styles.sampleTitle}>{googleSheetsI18n.t('sampleTitle')}</Text>
          <Text style={styles.sampleText}>{googleSheetsI18n.t('sampleParagraph')}</Text>
          <View style={styles.infoBadge}>
            <Text style={styles.meta}>
              Current: <Text style={styles.metaBold}>{selectedLang}</Text> | 
              Available: <Text style={styles.metaBold}>{googleSheetsI18n.getAvailableLanguages().join(', ')}</Text>
            </Text>
          </View>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E9F0',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#E8E9F0',
  },
  inner: {
    flexGrow: 1,
    padding: 24,
  },
  headerContainer: {
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A2E',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#4A5568',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A2E',
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  langContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  langButton: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langButtonActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  langButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  langButtonTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  
  systemInfoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  systemBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  systemBtnText: {
    color: '#4A5568',
    fontSize: 15,
    fontWeight: '600',
  },
  sampleCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A2E',
    textAlign: 'left',
  },
  sampleText: {
    fontSize: 17,
    color: '#2D3748',

    marginBottom: 12,

    textAlign: 'left',
  },
  meta: {
    fontSize: 13,
    color: '#718096',
    fontStyle: 'italic',
    textAlign: 'left',
  },
  metaBold: {
    fontWeight: '700',
    color: '#4A5568',
  },
  infoBadge: {
    backgroundColor: '#E5EEF5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default GoogleSheetsLocalizationScreen;

