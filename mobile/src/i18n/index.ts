import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation resources
import en from './locales/en.json';
import tr from './locales/tr.json';

// Sistem dilini al
const systemLanguage = getLocales()[0]?.languageCode || 'tr';

const resources = {
  en: {
    translation: en
  },
  tr: {
    translation: tr
  }
};

// Kaydedilen dil tercihini yükle
const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('selected_language');
    return savedLanguage || systemLanguage;
  } catch (error) {
    console.warn('Failed to load saved language:', error);
    return systemLanguage;
  }
};

const initializeI18n = async () => {
  const initialLanguage = await initializeLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'tr', // Varsayılan dil Türkçe
      debug: __DEV__,

      interpolation: {
        escapeValue: false, // React zaten XSS'e karşı korumalı
      },

      // Namespace kullanmak istemiyoruz
      defaultNS: 'translation',
      ns: ['translation'],

      // Cache ayarları
      saveMissing: __DEV__, // Geliştirme ortamında eksik çevirileri kaydet
      missingKeyHandler: (lng, ns, key, fallbackValue) => {
        if (__DEV__) {
          console.warn(`Missing translation key: ${key} for language: ${lng}`);
        }
      },

      // React ayarları
      react: {
        useSuspense: false,
      },
    });
};

// Initialize i18n
initializeI18n();

export default i18n;