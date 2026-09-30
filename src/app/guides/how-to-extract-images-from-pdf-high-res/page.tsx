import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  FileImage,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Extract & Convert PDF Pages to High-Resolution JPG & PNG (300 DPI) - Qubezip',
  description:
    'Step-by-step guide to converting multi-page PDF documents into crisp, high-resolution JPG and lossless PNG image files without quality loss.',
};

export default function GuideExtractImagesFromPdf() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Extract and Convert PDF Pages to High-Resolution JPG & PNG (300 DPI)',
    description:
      'Learn how raster rendering pipelines extract embedded photos and full-page spreads into crisp, lossless PNG and high-quality JPEG graphics.',
    author: {
      '@type': 'Organization',
      name: 'Qubezip Graphics Team',
      url: 'https://qubezip.online/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qubezip',
      url: 'https://qubezip.online',
    },
    datePublished: '2026-09-15',
    dateModified: '2026-09-15',
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-200">
            <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
            <span>Document to Image Conversion</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How to Extract and Convert PDF Pages to High-Resolution JPG &amp; PNG (300 DPI)
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold border-b border-slate-200 pb-4">
            <span>By <strong>Qubezip Graphics Team</strong></span>
            <span>•</span>
            <span>Published: September 15, 2026</span>
            <span>•</span>
            <span>5 min read</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">✓ High-DPI Rendering Verified</span>
          </div>
        </header>

        {/* Article Body */}
        <article className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              Whether you need to embed a presentation slide into a PowerPoint deck, post an infographic on social media, or submit a graphic portfolio page, converting PDF documents into high-resolution JPG or lossless PNG is a common requirement.
            </p>
            <p>
              In this tutorial, we explain the difference between JPG and PNG output modes, DPI rendering multipliers, and how to convert multi-page documents directly within your browser.
            </p>
          </section>

          {/* JPG vs PNG Comparison */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-rose-600" />
              <span>1. JPG vs. PNG: Which Format Should You Choose?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black">JPEG / JPG Format</strong>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Best for Photos</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ideal for scanned book pages, photographic brochures, and documents with colorful image artwork. Produces compact file sizes (~200KB-800KB per page).
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-black">PNG Format (Lossless)</strong>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Best for Text &amp; Diagrams</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Perfect for architectural blueprints, charts, text-heavy contracts, and spreadsheets. 100% pixel-perfect clarity with zero compression blurring around letters.
                </p>
              </div>
            </div>
          </section>

          {/* DPI and Viewport Scaling */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-indigo-600" />
              <span>2. Understanding DPI &amp; Canvas Rendering Scales</span>
            </h2>
            <p>
              By default, standard PDF files render at 72 DPI (Points Per Inch). When rasterizing to digital images:
            </p>
            <ul className="list-disc list-inside space-y-2 font-medium text-xs sm:text-sm pl-2">
              <li><strong>1.0x Scale (72 DPI - Standard Web):</strong> Fast conversion, ideal for quick thumbnails and online previews.</li>
              <li><strong>2.0x Scale (150 DPI - High Definition):</strong> Sharp on Retina and 4K mobile displays.</li>
              <li><strong>3.0x - 4.0x Scale (300 DPI - Print Quality):</strong> Crisp enough for physical color printing and professional publishing.</li>
            </ul>
          </section>

          {/* Conversion Steps on Qubezip */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileImage className="w-6 h-6 text-emerald-600" />
              <span>3. How to Convert PDF to Images on Qubezip</span>
            </h2>

            <ol className="list-decimal list-inside space-y-3 font-medium">
              <li>Navigate to <Link href="/pdf-to-image" className="text-blue-600 font-bold underline">PDF to Image Converter</Link>.</li>
              <li>Drag and drop your multi-page PDF file into the drop zone.</li>
              <li>Select your preferred format (<strong>PNG</strong> or <strong>JPG</strong>).</li>
              <li>Click <em>"Convert to Images"</em>. Preview all extracted pages directly on screen and download individual images or a packaged ZIP archive.</li>
            </ol>
          </section>

          {/* Privacy Note */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                100% In-Browser Rendering
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                Pages are rasterized directly using HTML5 Canvas inside your browser memory. Your confidential documents are never uploaded to any remote server.
              </p>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
