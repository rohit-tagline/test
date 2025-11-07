import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ar from '../locales/ar.json';

const locales = RNLocalize.getLocales();
const defaultLanguage = (Array.isArray(locales) && locales.length > 0 && locales[0].languageCode) || 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ar: { translation: ar },
    },
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// After init, honor any persisted language choice ("system" uses device language)
(async () => {
  try {
    const stored = await AsyncStorage.getItem('appLanguage');
    if (stored) {
      if (stored === 'system') {
        const loc = RNLocalize.getLocales();
        const code = (Array.isArray(loc) && loc[0]?.languageCode) || 'en';
        await i18n.changeLanguage(code);
      } else {
        await i18n.changeLanguage(stored);
      }
    }
  } catch (_) {
    // ignore
  }
})();

export default i18n;


