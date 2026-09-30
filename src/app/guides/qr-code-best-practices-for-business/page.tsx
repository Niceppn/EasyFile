import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Maximize2,
  ScanLine,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'QR Code Best Practices for Business: Sizing, Contrast & Error Correction - Qubezip',
  description:
    'Complete guide to designing and generating scannable QR codes for business cards, restaurant menus, product packaging, and payment terminals with high Reed-Solomon error correction.',
};

export default function GuideQrCodeBestPractices() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'QR Code Best Practices for Business: Sizing, Contrast & Error Correction Levels',
    description:
      'Master Reed-Solomon error correction (L, M, Q, H), quiet zones, and vector export formats to ensure your QR codes scan instantly on all mobile cameras.',
    author: {
      '@type': 'Organization',
      name: 'Qubezip QR Engineering Team',
      url: 'https://qubezip.online/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qubezip',
      url: 'https://qubezip.online',
    },
    datePublished: '2026-09-19',
    dateModified: '2026-09-19',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Knowledge Hub</span>
          </Link>
        </div>

        {/* Header */}
        <header className="space-y-4 mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-200">
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>QR Technology & Marketing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            QR Code Best Practices for Business: Sizing, Contrast &amp; Error Correction Levels
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold border-b border-slate-200 pb-4">
            <span>By <strong>Qubezip QR Engineering Team</strong></span>
            <span>•</span>
            <span>Published: September 19, 2026</span>
            <span>•</span>
            <span>6 min read</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">✓ ISO/IEC 18004 Standard Compliant</span>
          </div>
        </header>

        {/* Article Body */}
        <article className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              From restaurant tabletop menus and business cards to billboard advertisements and PromptPay payment checkout counters, QR codes have become ubiquitous. Yet thousands of businesses print unreadable QR codes due to inverted colors, insufficient quiet zones, or incorrect error correction levels.
            </p>
            <p>
              In this guide, we explore the international ISO/IEC 18004 QR Code standard and provide actionable rules to ensure 100% scanning reliability across all smartphone cameras.
            </p>
          </section>

          {/* Error Correction Levels */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-amber-600" />
              <span>1. Demystifying Reed-Solomon Error Correction (L, M, Q, H)</span>
            </h2>
            <p>
              QR codes use <strong>Reed-Solomon Error Correction</strong>, a mathematical algorithm that allows scanners to decode data even if part of the code is dirty, smudged, torn, or covered by a central company logo:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black">Level L (Low - 7%)</strong>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Clean Display</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Best for clean digital screens and simple URLs. Generates fewer dense dots, making it fast to focus.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black">Level M (Medium - 15%)</strong>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Standard</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  The default standard for business cards, flyers, and standard web links. Excellent balance of density and resilience.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black">Level Q (Quartile - 25%)</strong>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Outdoor</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ideal for outdoor posters, restaurant tables, and packaging prone to minor wear or scratches.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black">Level H (High - 30%)</strong>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">Logo Embed</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Mandatory if embedding a brand logo in the center of the QR code. Allows up to 30% of surface area to be obscured.
                </p>
              </div>
            </div>
          </section>

          {/* Sizing & Scanning Distance Formula */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Maximize2 className="w-6 h-6 text-blue-600" />
              <span>2. The 10:1 Sizing vs. Scanning Distance Ratio</span>
            </h2>
            <p>
              A common mistake is printing a 1-inch QR code on a billboard intended to be viewed from 10 feet away. Follow the industry standard <strong>10:1 Ratio</strong>:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center font-bold text-blue-950 text-sm sm:text-base">
              QR Code Width = Scanning Distance ÷ 10
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 pl-2">
              <li><strong>Business Card (10-15 cm distance):</strong> Minimum 2 x 2 cm (0.8 x 0.8 inches).</li>
              <li><strong>Restaurant Menu (30-50 cm distance):</strong> Minimum 3 x 3 cm (1.2 x 1.2 inches).</li>
              <li><strong>Poster / Window Decal (2 meters distance):</strong> Minimum 20 x 20 cm (8 x 8 inches).</li>
            </ul>
          </section>

          {/* Contrast & Quiet Zone Rules */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>3. Contrast &amp; Quiet Zone Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Dark Foreground on Light Background</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Always use dark modules (black, deep navy) over a light/white background. Inverted codes (white dots on black background) fail on 40% of native camera apps.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Maintain a 4-Module Quiet Zone</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Leave an empty white border around the QR code of at least 4 module widths. Cluttered graphics touching the edge confuse finder patterns.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Create or Scan QR Codes with Qubezip</p>
              <p className="text-xs text-slate-500">Free high-res vector output and instant Ctrl+V image decoder.</p>
            </div>
            <Link
              href="/qr-code-generator"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Launch QR Studio</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
