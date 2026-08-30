'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, dictionary } from './dictionary';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionary.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default global initial state set to 'en' (English) to prevent 1-second Thai flash for international users
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check saved language preference in localStorage
    const savedLang = localStorage.getItem('qubezip_lang') as Language | null;

    if (savedLang && ['th', 'en', 'ja', 'ko', 'fr', 'es', 'de', 'zh'].includes(savedLang)) {
      setLanguageState(savedLang);
      setIsInitialized(true);
    } else {
      // 2. Fetch Geo-IP Country Code from Cloudflare via /api/geo
      fetch('/api/geo')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country) {
            const country = data.country.toUpperCase();
            if (country === 'TH') {
              setLanguageState('th');
            } else if (country === 'JP') {
              setLanguageState('ja');
            } else if (country === 'KR') {
              setLanguageState('ko');
            } else if (['FR', 'BE', 'MC'].includes(country)) {
              setLanguageState('fr');
            } else if (['ES', 'MX', 'AR', 'CL', 'CO', 'PE'].includes(country)) {
              setLanguageState('es');
            } else if (['DE', 'AT', 'CH'].includes(country)) {
              setLanguageState('de');
            } else if (['CN', 'TW', 'HK', 'SG'].includes(country)) {
              setLanguageState('zh');
            } else {
              // US, UK, CA, AU, etc. -> English
              setLanguageState('en');
            }
          } else {
            // Fallback to browser language
            const browserLang = (navigator.language || '').toLowerCase();
            if (browserLang.startsWith('th')) {
              setLanguageState('th');
            } else if (browserLang.startsWith('ja')) {
              setLanguageState('ja');
            } else if (browserLang.startsWith('ko')) {
              setLanguageState('ko');
            } else if (browserLang.startsWith('fr')) {
              setLanguageState('fr');
            } else if (browserLang.startsWith('es')) {
              setLanguageState('es');
            } else if (browserLang.startsWith('de')) {
              setLanguageState('de');
            } else if (browserLang.startsWith('zh')) {
              setLanguageState('zh');
            } else {
              setLanguageState('en');
            }
          }
        })
        .catch(() => {
          // Fallback on network error
          const browserLang = (navigator.language || '').toLowerCase();
          if (browserLang.startsWith('th')) {
            setLanguageState('th');
          } else if (browserLang.startsWith('ja')) {
            setLanguageState('ja');
          } else if (browserLang.startsWith('ko')) {
            setLanguageState('ko');
          } else if (browserLang.startsWith('fr')) {
            setLanguageState('fr');
          } else if (browserLang.startsWith('es')) {
            setLanguageState('es');
          } else if (browserLang.startsWith('de')) {
            setLanguageState('de');
          } else if (browserLang.startsWith('zh')) {
            setLanguageState('zh');
          } else {
            setLanguageState('en');
          }
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, []);

  // Update browser tab title dynamically whenever language changes
  useEffect(() => {
    const currentDict = dictionary[language] || dictionary.en;
    if (currentDict && currentDict.docTitle) {
      document.title = currentDict.docTitle;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('qubezip_lang', lang);
    const currentDict = dictionary[lang] || dictionary.en;
    if (currentDict && currentDict.docTitle) {
      document.title = currentDict.docTitle;
    }
  };

  const t = dictionary[language] || dictionary.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
