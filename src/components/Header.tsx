'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { FileText, Image as ImageIcon, QrCode, Megaphone } from 'lucide-react';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-4 hover:opacity-95 transition-opacity">
          <div className="relative h-16 sm:h-20 w-auto flex-shrink-0 flex items-center">
            <Image
              src="/logo.png?v=2"
              alt="EasyFile Logo"
              width={260}
              height={80}
              className="h-16 sm:h-20 w-auto object-contain"
              priority
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {t.headerBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.headerSub}
            </p>
          </div>
        </Link>

        {/* Navigation Bar & Language Switcher */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{t.navCompressPdf}</span>
          </Link>

          <Link
            href="/pdf-to-image"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <ImageIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{t.navPdfToImage}</span>
          </Link>

          <Link
            href="/qr-code-generator"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <QrCode className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>{t.navQrGenerator}</span>
          </Link>

          <Link
            href="/contact-advertising"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors px-2 py-2 rounded-xl hover:bg-slate-100/80"
          >
            <Megaphone className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>{t.navContactAd}</span>
          </Link>

          {/* TH / EN Language Switcher */}
          <div className="ml-1 sm:ml-2">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
