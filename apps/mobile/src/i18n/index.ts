import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esAR from './es-AR.json';
import en from './en.json';

i18n.use(initReactI18next).init({
  resources: {
    'es-AR': { translation: esAR },
    en: { translation: en },
  },
  lng: 'es-AR',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
