import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, Alert, SafeAreaView, DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import '../services/i18n';
import RNRestart from 'react-native-restart';

const SUPPORTED = ['en', 'hi', 'ar'];

const LocalizationScreen = () => {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language);
  const systemLang = useMemo(() => {
    const locales = RNLocalize.getLocales();
    const code = (Array.isArray(locales) && locales[0]?.languageCode) || 'en';
    return SUPPORTED.includes(code) ? code : 'en';
  }, []);

  // Keep original behavior: rely on I18nManager for app-wide direction

  // Load persisted language choice on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('appLanguage');
        if (stored) {
          if (stored === 'system') {
            const loc = RNLocalize.getLocales();
            const sys = (Array.isArray(loc) && loc[0]?.languageCode) || 'en';
            const fallback = SUPPORTED.includes(sys) ? sys : 'en';
            setSelected(fallback);
            await i18n.changeLanguage(fallback);
          } else if (SUPPORTED.includes(stored)) {
            setSelected(stored);
            await i18n.changeLanguage(stored);
          }
        }
      } catch (_) {}
    })();
  }, [i18n]);

  const applyImmediately = useCallback(async (nextLang) => {
    try {
      setSelected(nextLang);
      await i18n.changeLanguage(nextLang);
      await AsyncStorage.setItem('appLanguage', nextLang);
      const shouldBeRTL = nextLang === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(shouldBeRTL);
        // Hard reload the app to apply RTL/LTR direction properly
        try {
          // DevSettings.reload();
            RNRestart.restart();
        } catch (_) {
          Alert.alert('Restart required', 'Please restart the app to apply layout direction.');
        }
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }, [i18n]);

  const setSystemDefault = useCallback(async () => {
    await AsyncStorage.setItem('appLanguage', 'system');
    await applyImmediately(systemLang);
  }, [applyImmediately, systemLang]);

  const LangButton = ({ code, label }) => (
    <TouchableOpacity
      style={[styles.langBtn, selected === code && styles.langBtnActive]}
      onPress={() => applyImmediately(code)}
    >
      <Text style={[styles.langLabel, selected === code && styles.langLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.description}>{t('description')}</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.section}>{t('chooseLanguage')}</Text>
        <View style={styles.row}>
          <LangButton code="en" label={t('english')} />
          <LangButton code="hi" label={t('hindi')} />
          <LangButton code="ar" label={t('arabic')} />
        </View>

        <View style={styles.systemInfoContainer}>
          <Text style={styles.meta}>
            {t('systemLanguage', { defaultValue: 'System language' })}:{' '}
            <Text style={styles.metaBold}>{systemLang}</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.systemBtn} onPress={setSystemDefault}>
          <Text style={styles.systemBtnText}>{t('systemDefault')}</Text>
        </TouchableOpacity>

        <View style={styles.card} >
          <Text style={styles.cardTitle}>{t('How it Works')}</Text>
          <Text style={styles.paragraph}>{t('sampleParagraph')}</Text>
          <View style={styles.infoBadge}>
            <Text style={styles.meta}>
              Current: <Text style={styles.metaBold}>{selected}</Text> | RTL:{' '}
              <Text style={styles.metaBold}>{String(I18nManager.isRTL)}</Text>
            </Text>
          </View>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E8E9F0',
  },
  inner: {
    flexGrow: 1,
    padding: 24,
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
  section: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 16,
    color: '#1A1A2E',
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  row: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  langBtn: { 
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
  langBtnActive: { 
    borderColor: '#4F46E5', 
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  langLabel: { 
    color: '#64748B', 
    fontSize: 15,
    fontWeight: '500',
  },
  langLabelActive: { 
    color: '#4F46E5', 
    fontWeight: '700',
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
  card: { 
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
  paragraph: { 
    fontSize: 17, 
    color: '#2D3748', 
    marginBottom: 12,
    // lineHeight: 26,
    // letterSpacing: 0.2,
    textAlign:"left"
  },
  meta: { 
    fontSize: 13, 
    color: '#718096',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign:"left"
  },
  metaBold: {
    fontWeight: '700',
    color: '#4A5568',
  },
  headerContainer: {
    marginBottom: 32,
    paddingTop: 20,
    alignSelf: 'stretch',
  },
  contentSection: {
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  systemInfoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
    letterSpacing: 0.3,
    textAlign: 'left',
  },
  infoBadge: {
    backgroundColor: '#E9F2F8',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
  },
});

export default LocalizationScreen;


