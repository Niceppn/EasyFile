'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { Language } from '@/lib/i18n/dictionary';

// SVG Vector Flags
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

function KoreaFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="600" fill="#FFFFFF" />
      <path d="M450,150 A150,150 0 0,1 450,450 A75,75 0 0,1 450,300 A75,75 0 0,0 450,150 Z" fill="#C60C30" />
      <path d="M450,450 A150,150 0 0,1 450,150 A75,75 0 0,1 450,300 A75,75 0 0,0 450,450 Z" fill="#003478" />
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

function SpainFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="150" fill="#AA1515" />
      <rect y="150" width="900" height="300" fill="#F1BF00" />
      <rect y="450" width="900" height="150" fill="#AA1515" />
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

function ChinaFlag() {
  return (
    <svg viewBox="0 0 900 600" className="w-4 h-3 rounded-[2px] shadow-xs inline-block flex-shrink-0 border border-slate-200">
      <rect width="900" height="600" fill="#DE2910" />
      <path d="M120,60 L135,105 L180,105 L142,132 L157,177 L120,150 L83,177 L98,132 L60,105 L105,105 Z" fill="#FFDE00" />
    </svg>
  );
}

interface LanguageOption {
  code: Language;
  name: string;
  shortLabel: string;
  flag: React.ReactNode;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'th', name: 'ไทย (Thai)', shortLabel: 'TH', flag: <ThaiFlag /> },
  { code: 'en', name: 'English (UK/US)', shortLabel: 'EN', flag: <UkFlag /> },
  { code: 'ja', name: '日本語 (Japanese)', shortLabel: 'JP', flag: <JapanFlag /> },
  { code: 'ko', name: '한국어 (Korean)', shortLabel: 'KR', flag: <KoreaFlag /> },
  { code: 'fr', name: 'Français (French)', shortLabel: 'FR', flag: <FranceFlag /> },
  { code: 'es', name: 'Español (Spanish)', shortLabel: 'ES', flag: <SpainFlag /> },
  { code: 'de', name: 'Deutsch (German)', shortLabel: 'DE', flag: <GermanyFlag /> },
  { code: 'zh', name: '中文 (Chinese)', shortLabel: 'CN', flag: <ChinaFlag /> },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Current Selected Language Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-200 text-xs font-black text-slate-800 transition-all shadow-xs cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {currentLangObj.flag}
        <span>{currentLangObj.shortLabel}</span>
        <svg
          className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Language Selector Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] py-1.5 max-h-[65vh] overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100 mb-1 sticky top-0 bg-white">
            Select Language / 言語 / 언어
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                language === lang.code
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {lang.flag}
              <span className="flex-1 text-left">{lang.name}</span>
              {language === lang.code && (
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
