import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';

/**
 * Initialise la configuration de i18next pour la gestion de l'internationalisation dans l'application.
 * @returns {Object} L'instance i18n configurée pour l'application.
 */
i18n.use(initReactI18next).init({

  // Définit les ressources de traduction pour les langues prises en charge (français et anglais)
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },

  // Définit la langue par défaut à utiliser pour les traductions. Tente de récupérer la langue précédemment sélectionnée dans le localStorage, ou utilise le français par défaut.  
  lng: localStorage.getItem('lang') || 'fr',

  // Définit la langue de secours à utiliser si une traduction n'est pas disponible pour la langue sélectionnée
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => localStorage.setItem('lang', lng));

export default i18n;