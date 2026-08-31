import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr";
import en from "./locales/en";

const langueSauvegardee = localStorage.getItem("help-me-language");

i18n.use(initReactI18next).init({
  resources: {
    fr: {
      translation: fr,
    },
    en: {
      translation: en,
    },
  },

  lng: langueSauvegardee || "fr",

  fallbackLng: "fr",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
