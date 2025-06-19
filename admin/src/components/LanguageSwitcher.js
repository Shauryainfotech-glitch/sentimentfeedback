import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableLanguages } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

// Language name mapping for display
const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी'
};

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage(); // Use the language context
  const availableLanguages = getAvailableLanguages();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLanguageChange = (lang) => {
    if (lang === currentLanguage) {
      setIsOpen(false);
      return;
    }
    
    // Change the language using the context function
    changeLanguage(lang);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <div className="language-display" onClick={() => setIsOpen(!isOpen)}>
        <span className="current-language">{languageNames[currentLanguage] || currentLanguage}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="language-dropdown">
          {availableLanguages.map(lang => (
            <div 
              key={lang} 
              className={`language-item ${currentLanguage === lang ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang)}
            >
              {languageNames[lang] || lang}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
