import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  FileCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Compress PDF Without Losing Quality: The Complete Guide - Qubezip',
  description:
    'Step-by-step technical guide on compressing PDF files without losing quality. Learn how vector preservation, adaptive JPEG downsampling, and FlateDecode maintain crisp text.',
};

export default function GuideCompressWithoutLosingQuality() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Compress PDF Without Losing Quality: The Complete Guide',
    description:
      'Learn how modern compression algorithms reduce PDF file sizes by up to 80% while preserving razor-sharp text and graphics.',
    author: {
      '@type': 'Organization',
      name: 'Qubezip Engineering Team',
      url: 'https://qubezip.online/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qubezip',
      url: 'https://qubezip.online',
    },
    datePublished: '2026-09-28',
    dateModified: '2026-09-28',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Knowledge Hub</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold border border-blue-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>PDF Optimization & Quality</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How to Compress PDF Without Losing Quality (Complete Technical Guide)
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold border-b border-slate-200 pb-4">
            <span>By <strong>Qubezip Engineering Team</strong></span>
            <span>•</span>
            <span>Published: September 28, 2026</span>
            <span>•</span>
            <span>6 min read</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">✓ Fact-Checked & Verified</span>
          </div>
        </header>

        {/* Article Body */}
        <article className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              Everyone has faced the frustrating message: <em>"File size exceeds the maximum upload limit of 1MB."</em> When attempting to shrink a PDF, many generic online tools indiscriminately downscale every page, turning crisp invoices, resumes, and architectural blueprints into blurry, unreadable pixels.
            </p>
            <p>
              In this guide, we break down how PDF data structures work and how intelligent, multi-stage compression algorithms reduce file size by <strong>60% to 85%</strong> without sacrificing visual clarity.
            </p>
          </section>

          {/* Core Concept: Vector vs Raster */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              <span>1. Understanding PDF Architecture: Vectors vs. Rasters</span>
            </h2>
            <p>
              A PDF (Portable Document Format) is not a single flat image. It is a container comprising three distinct layers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Vector Text & Glyphs</strong>
                <p className="text-xs text-slate-500">Mathematical coordinates defining letterforms. Perfectly sharp at infinite zoom with tiny byte footprint.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Embedded Raster Images</strong>
                <p className="text-xs text-slate-500">JPEG/PNG photographs, scanned ID cards, and seals. Accounts for 90%+ of total document file size.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Structural Metadata</strong>
                <p className="text-xs text-slate-500">Color profiles, unreferenced font subsets, revision histories, and thumbnail streams.</p>
              </div>
            </div>
          </section>

          {/* 3 Steps to Compress Without Blurring */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-indigo-600" />
              <span>2. The 3 Technical Pillars of Lossless & Near-Lossless Compression</span>
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">A. Adaptive DPI Scaling (150–200 DPI Sweet Spot)</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Scanned documents often output at 300 to 600 DPI, generating massive 20MB files. Human eyes and computer monitors cannot distinguish 300 DPI from 150 DPI on standard screens. Reducing density to 150–200 DPI slashes file size by 70% while keeping fine print sharp.
                </p>
              </div>

              <div className="border-l-4 border-indigo-600 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">B. FlateDecode Stream Optimization</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  FlateDecode is a lossless data compression algorithm based on LZ77 and Huffman coding. It compresses raw binary page descriptions without removing a single pixel or character.
                </p>
              </div>

              <div className="border-l-4 border-emerald-600 pl-4 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">C. Unused Font & Metadata Stripping</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Many PDF editors embed entire multi-megabyte font libraries even if only 5 letters are used. Subsetting fonts to include only used glyphs reduces overhead dramatically.
                </p>
              </div>
            </div>
          </section>

          {/* Step-by-Step Tutorial using Qubezip */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-emerald-600" />
              <span>3. Step-by-Step: How to Compress a PDF on Qubezip</span>
            </h2>

            <ol className="list-decimal list-inside space-y-3 font-medium">
              <li>
                <strong>Select your file:</strong> Drag and drop your PDF into the <Link href="/" className="text-blue-600 font-bold underline">Qubezip Compressor</Link>.
              </li>
              <li>
                <strong>Choose your Target Size:</strong> Select <strong>1MB</strong>, <strong>500KB</strong>, or set a custom target in KB.
              </li>
              <li>
                <strong>Instant In-Browser Processing:</strong> Click <em>"Compress PDF"</em>. The client-side WebAssembly engine renders the optimized PDF directly in your browser memory within 1–2 seconds.
              </li>
              <li>
                <strong>Download & Verify:</strong> Download your compressed document and inspect text clarity at 100% and 200% zoom.
              </li>
            </ol>
          </section>

          {/* Security Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                100% Client-Side Privacy Guarantee
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                Unlike traditional online converters, Qubezip never uploads your files to any remote cloud server. All compression computations happen locally inside your browser.
              </p>
            </div>
          </div>

          {/* Conclusion & Call to Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Ready to compress your PDF document?</p>
              <p className="text-xs text-slate-500">Free, instant, and zero server upload.</p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Compress PDF Now</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
