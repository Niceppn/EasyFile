'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FileText, Image as ImageIcon, QrCode, Megaphone, Menu, X } from 'lucide-react';

export function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity flex-shrink-0">
          <div className="relative h-10 sm:h-14 w-auto flex-shrink-0 flex items-center">
            <Image
              src="/logo.png?v=3"
              alt="Qubezip Logo"
              width={220}
              height={70}
              className="h-10 sm:h-14 w-auto object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="hidden lg:block">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {t.headerBadge}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs lg:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2.5 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{t.navCompressPdf}</span>
          </Link>

          <Link
            href="/pdf-to-image"
            className="flex items-center gap-1.5 text-xs lg:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2.5 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{t.navPdfToImage}</span>
          </Link>

          <Link
            href="/qr-code-generator"
            className="flex items-center gap-1.5 text-xs lg:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2.5 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <QrCode className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>{t.navQrGenerator}</span>
          </Link>

          <Link
            href="/contact-advertising"
            className="flex items-center gap-1.5 text-xs lg:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2.5 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <Megaphone className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{t.navContactAd}</span>
          </Link>

          {/* Language Switcher Dropdown */}
          <div className="ml-1 relative">
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Mobile Right Controls: Language Switcher & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-sm font-bold text-slate-800 hover:text-blue-600 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{t.navCompressPdf}</span>
          </Link>

          <Link
            href="/pdf-to-image"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-sm font-bold text-slate-800 hover:text-blue-600 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            <span>{t.navPdfToImage}</span>
          </Link>

          <Link
            href="/qr-code-generator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-sm font-bold text-slate-800 hover:text-blue-600 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span>{t.navQrGenerator}</span>
          </Link>

          <Link
            href="/contact-advertising"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-sm font-bold text-slate-800 hover:text-blue-600 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            <Megaphone className="w-5 h-5 text-amber-500" />
            <span>{t.navContactAd}</span>
          </Link>
        </div>
      )}
    </header>
  );
}
