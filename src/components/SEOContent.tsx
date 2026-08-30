'use client';

import Link from 'next/link';
import { ArrowRight, QrCode, Lock, Sliders } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface SEOContentProps {
  title?: string;
  targetPresetText?: string;
}

export function SEOContent({ title, targetPresetText }: SEOContentProps) {
  const { t } = useLanguage();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Qubezip - PDF Compressor & QR Code Generator',
    url: 'https://qubezip.online',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    description:
      'Free online utility tools to compress PDF files to target sizes and generate QR codes.',
  };

  return (
    <div className="mt-16 space-y-12">
      {/* Schema JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {t.seoFeature1Title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.seoFeature1Sub}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {t.seoFeature2Title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.seoFeature2Sub}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {t.seoFeature3Title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.seoFeature3Sub}
          </p>
        </div>
      </div>

      {/* Internal Linking SEO Matrix */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <h3 className="text-xl font-bold mb-2">{t.seoMatrixTitle}</h3>
        <p className="text-sm text-slate-400 mb-6">
          {t.seoMatrixSub}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/qr-code-generator"
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all group flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-indigo-400">
                {t.seoMatrixQr}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{t.seoMatrixQrSub}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/compress-pdf-to-1mb"
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all group flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-blue-400">
                {t.seoMatrix1mb}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{t.seoMatrix1mbSub}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/compress-pdf-to-500kb"
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all group flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-blue-400">
                {t.seoMatrix500kb}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{t.seoMatrix500kbSub}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/compress-pdf-for-email"
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all group flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-sm text-white group-hover:text-blue-400">
                {t.seoMatrixEmail}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{t.seoMatrixEmailSub}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
