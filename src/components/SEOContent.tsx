'use client';

import Link from 'next/link';
import { ArrowRight, QrCode, Lock, Sliders, FileText, CheckCircle2, HelpCircle, BookOpen, ShieldCheck } from 'lucide-react';
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
    name: 'Qubezip - In-Browser PDF Compressor & QR Code Studio',
    url: 'https://qubezip.online',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    description:
      'Free online utility tools to compress PDF files to exact target sizes (1MB, 500KB) and generate QR codes with 100% in-browser privacy.',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is it safe to compress sensitive PDF files on Qubezip?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, 100%. Qubezip uses client-side WebAssembly technology. Your files are processed inside your web browser memory and are never uploaded to any remote server.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I compress a PDF to under 1MB or 500KB for government job portals?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply upload your PDF, select the 1MB or 500KB target preset (or set a custom target size in KB), and click Compress. The smart adaptive algorithm calculates optimal DPI and quality balance.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are there any usage limits or subscription fees?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Qubezip is completely free with no file limits, no watermark, and no registration required.',
        },
      },
    ],
  };

  return (
    <div className="mt-16 space-y-12 text-slate-800">
      {/* Schema JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
            {t.seoFeature1Title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.seoFeature1Sub}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
            {t.seoFeature2Title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.seoFeature2Sub}
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
            {t.seoFeature3Title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.seoFeature3Sub}
          </p>
        </div>
      </div>

      {/* Educational Guide Section: How In-Browser Compression Works */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6 text-left">
        <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-black">
            The Complete Guide to In-Browser PDF Compression & Optimization
          </h2>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
          <p>
            When submitting resumes, tax records, university applications, or legal documents to web portals, users frequently encounter strict file size limits (such as <strong>under 1MB</strong>, <strong>500KB</strong>, or <strong>2MB</strong>). Traditional online tools require you to upload your files to remote cloud servers, exposing your private data to potential leaks and long queue times.
          </p>

          <h3 className="text-lg font-black text-slate-900 pt-2">
            Why Client-Side WebAssembly Architecture is Superior:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Server Upload</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Binary stream data is rendered inside the browser runtime using HTML5 Canvas & WebAssembly. Your files never touch a server disk.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Adaptive Quality Curve</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Text characters remain sharp and legible while redundant image metadata and uncompressed raster objects are intelligently reduced.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive FAQ Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6 text-left">
        <div className="flex items-center gap-2.5 text-slate-900 border-b border-slate-100 pb-4">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl sm:text-2xl font-black">
            Frequently Asked Questions (FAQ)
          </h2>
        </div>

        <div className="space-y-5 text-sm sm:text-base">
          <div className="space-y-1.5">
            <h4 className="font-black text-slate-900">
              Q: Is there any risk of my documents being seen by third parties?
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              No. Because Qubezip executes entirely within your browser via JavaScript & WebAssembly, no network payload containing your document data is ever sent to our servers or third-party APIs.
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-black text-slate-900">
              Q: What is the recommended size for email attachments and job portals?
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Most recruitment portals and government agency upload systems (such as OCSC Thailand, university admissions, and corporate ATS systems) limit individual PDF uploads to <strong>1MB</strong> or <strong>500KB</strong>. Use our one-click presets to target those exact thresholds.
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="font-black text-slate-900">
              Q: Can I also scan and read QR codes from screenshots?
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Yes! Use our built-in <Link href="/qr-code-generator" className="text-blue-600 font-bold underline">QR Code Studio</Link> to generate custom QR codes or simply press <strong>Ctrl+V</strong> to paste a screenshot and decode target URLs instantly with animated laser detection.
            </p>
          </div>
        </div>
      </div>

      {/* Internal Linking SEO Matrix */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl text-left">
        <h3 className="text-xl sm:text-2xl font-black mb-2">{t.seoMatrixTitle}</h3>
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
