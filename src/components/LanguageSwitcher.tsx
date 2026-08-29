'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';

// High-resolution SVG Vector Flags
function ThaiFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="600" fill="#A51931" />
      <rect y="100" width="900" height="400" fill="#F4F5F8" />
      <rect y="200" width="900" height="200" fill="#2D2A4A" />
    </svg>
  );
}

function UkFlag() {
  return (
    <svg viewBox="0 0 60 30" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v-30 h-30 z h-30 v-15 z v30 h30 z" />
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function JapanFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="600" fill="#FFFFFF" />
      <circle cx="450" cy="300" r="180" fill="#BC002D" />
    </svg>
  );
}

function FranceFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="300" height="600" fill="#002395" />
      <rect x="300" width="300" height="600" fill="#FFFFFF" />
      <rect x="600" width="300" height="600" fill="#ED2939" />
    </svg>
  );
}

function GermanyFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="200" fill="#000000" />
      <rect y="200" width="900" height="200" fill="#DD0000" />
      <rect y="400" width="900" height="200" fill="#FFCC00" />
    </svg>
  );
}

function SpainFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="150" fill="#AA1515" />
      <rect y="150" width="900" height="300" fill="#F1BF00" />
      <rect y="450" width="900" height="150" fill="#AA1515" />
    </svg>
  );
}

function ChinaFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="600" fill="#DE2910" />
      <path d="M120,60 L135,105 L180,105 L142,132 L157,177 L120,150 L83,177 L98,132 L60,105 L105,105 Z" fill="#FFDE00" />
    </svg>
  );
}

interface CountryInfo {
  code: string;
  label: string;
  flag: React.ReactNode;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [visitorCountry, setVisitorCountry] = useState<CountryInfo>({
    code: 'TH',
    label: 'TH',
    flag: <ThaiFlag />,
  });

  useEffect(() => {
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();

    if (browserLang.startsWith('ja')) {
      setVisitorCountry({ code: 'JA', label: 'JP', flag: <JapanFlag /> });
    } else if (browserLang.startsWith('fr')) {
      setVisitorCountry({ code: 'FR', label: 'FR', flag: <FranceFlag /> });
    } else if (browserLang.startsWith('de')) {
      setVisitorCountry({ code: 'DE', label: 'DE', flag: <GermanyFlag /> });
    } else if (browserLang.startsWith('es')) {
      setVisitorCountry({ code: 'ES', label: 'ES', flag: <SpainFlag /> });
    } else if (browserLang.startsWith('zh')) {
      setVisitorCountry({ code: 'ZH', label: 'CN', flag: <ChinaFlag /> });
    } else if (browserLang.startsWith('th')) {
      setVisitorCountry({ code: 'TH', label: 'TH', flag: <ThaiFlag /> });
    } else {
      setVisitorCountry({ code: 'TH', label: 'TH', flag: <ThaiFlag /> });
    }
  }, []);

  return (
    <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shadow-inner">
      {/* Local Visitor Country Button */}
      <button
        type="button"
        onClick={() => setLanguage('th')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
          language === 'th'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title={`Switch to ${visitorCountry.label}`}
      >
        {visitorCountry.flag}
        <span>{visitorCountry.label}</span>
      </button>

      {/* Global English Default Button */}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
          language === 'en'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Switch to English (Default)"
      >
        <UkFlag />
        <span>EN</span>
      </button>
    </div>
  );
}
