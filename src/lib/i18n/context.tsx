'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, dictionary } from './dictionary';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionary.th;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('th');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check saved language preference in localStorage
    const savedLang = localStorage.getItem('qubezip_lang') as Language | null;

    if (savedLang && (savedLang === 'th' || savedLang === 'en')) {
      setLanguageState(savedLang);
      setIsInitialized(true);
    } else {
      // 2. Fetch Geo-IP Country Code from Cloudflare via /api/geo
      fetch('/api/geo')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country) {
            if (data.country === 'TH') {
              setLanguageState('th');
            } else {
              // Switzerland (CH), US, UK, JP, DE, etc. -> English
              setLanguageState('en');
            }
          } else {
            // Fallback to browser language
            const browserLang = navigator.language || '';
            if (browserLang.toLowerCase().startsWith('th')) {
              setLanguageState('th');
            } else {
              setLanguageState('en');
            }
          }
        })
        .catch(() => {
          // Fallback on network error
          const browserLang = navigator.language || '';
          if (browserLang.toLowerCase().startsWith('th')) {
            setLanguageState('th');
          } else {
            setLanguageState('en');
          }
        })
        .finally(() => {
          setIsInitialized(true);
        });
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('qubezip_lang', lang);
  };

  const t = dictionary[language];

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
