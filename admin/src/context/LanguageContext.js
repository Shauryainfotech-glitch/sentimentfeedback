import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage as i18nChangeLanguage, getCurrentLanguage, LANGUAGE_CHANGED_EVENT } from '../i18n';

// Create the language context
export const LanguageContext = createContext();

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  // Initialize with stored language
  useEffect(() => {
    setCurrentLanguage(i18n.language);

    // Listen for language changes from other components
    const handleLanguageChangeEvent = (event) => {
      setCurrentLanguage(event.detail.language);
    };
    
    document.addEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChangeEvent);
    return () => {
      document.removeEventListener(LANGUAGE_CHANGED_EVENT, handleLanguageChangeEvent);
    };
  }, [i18n]);

  // Function to change language - this will propagate through context
  const changeLanguage = (lang) => {
    i18nChangeLanguage(lang);
    setCurrentLanguage(lang);
  };

  // Provide context values
  const contextValue = {
    currentLanguage,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
