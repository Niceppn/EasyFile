'use client';

import { Header } from '@/components/Header';
import { QrCodeGenerator } from '@/components/QrCodeGenerator';
import { FAQSection } from '@/components/FAQSection';
import { SEOContent } from '@/components/SEOContent';
import { LeftAdSidebar, RightAdSidebar, MobileAdBanner } from '@/components/AdSidebars';
import { useLanguage } from '@/lib/i18n/context';
import { ShieldCheck, Download, Copy, Ban } from 'lucide-react';

export default function QrCodePage() {
  const { t } = useLanguage();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Qubezip - QR Code Generator (No Ads)',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    description:
      'Free online QR Code Generator. 100% direct permanent links with zero ad popups or countdowns.',
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      {/* Main Layout Container with Left & Right Ad Sidebars */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex justify-center items-start gap-6">
        <LeftAdSidebar />

        <main className="flex-1 max-w-4xl w-full">
          {/* Main Hero Title */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold mb-4 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 fill-current text-emerald-600" />
              <span>{t.qrHeroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t.qrHeroTitleLine1} <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                {t.qrHeroTitleLine2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-medium">
              {t.qrHeroSub}
            </p>
          </div>

          {/* Core Generator Tool Container */}
          <div className="max-w-3xl mx-auto">
            <QrCodeGenerator />
          </div>

          {/* Feature Explainer Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
                <Ban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t.qrCard1Title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t.qrCard1Sub}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
                <Copy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t.qrCard2Title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t.qrCard2Sub}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {t.qrCard3Title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t.qrCard3Sub}
              </p>
            </div>
          </div>

          {/* Mobile Ad Banner */}
          <MobileAdBanner />

          <SEOContent />
          <FAQSection />
        </main>

        <RightAdSidebar />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          <p>{t.footerRights}</p>
        </div>
      </footer>
    </div>
  );
}
