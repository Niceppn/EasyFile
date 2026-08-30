'use client';

import { Header } from '@/components/Header';
import { PdfToImageConverter } from '@/components/PdfToImageConverter';
import { FAQSection } from '@/components/FAQSection';
import { SEOContent } from '@/components/SEOContent';
import { LeftAdSidebar, RightAdSidebar, MobileAdBanner } from '@/components/AdSidebars';
import { useLanguage } from '@/lib/i18n/context';
import { Image as ImageIcon } from 'lucide-react';

export default function PdfToImagePage() {
  const { t } = useLanguage();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Qubezip - Convert PDF to Image',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    description:
      'Free online PDF to image converter. Extract PDF pages to .JPG, .PNG, .WEBP with 1-click ZIP download.',
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-extrabold mb-4 border border-blue-200">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <span>{t.pdfImgHeroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t.pdfImgHeroTitleLine1} <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                {t.pdfImgHeroTitleLine2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-medium">
              {t.pdfImgHeroSub}
            </p>
          </div>

          {/* Core Converter Tool Container */}
          <div className="max-w-3xl mx-auto">
            <PdfToImageConverter />
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
