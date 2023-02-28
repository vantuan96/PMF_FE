import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from "./locales/en/translation.json";
import translationVi from "./locales/vi/translation.json";
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  // .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    lng: localStorage.getItem('locale') || 'vi',
    fallbackLng: 'vi',
    debug: true,
    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    },
    resources: {
      en: {
        translation: translationEn
      },
      vi: {
        translation: translationVi
      }
    }
  });


export default i18n;