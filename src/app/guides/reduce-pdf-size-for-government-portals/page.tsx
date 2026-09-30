import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Reduce PDF Size for Government & Job Portals (< 500KB & 1MB) - Qubezip',
  description:
    'Complete guide to compressing PDF documents for Thai government portals (ก.พ., OCSC), civil service applications, university admissions, and visa uploads.',
};

export default function GuideGovernmentPortals() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Reduce PDF File Size for Government & Job Portals (< 500KB & 1MB)',
    description:
      'Step-by-step instructions on formatting and compressing documents to pass strict upload restrictions on government and corporate HR portals.',
    author: {
      '@type': 'Organization',
      name: 'Qubezip Editorial Team',
      url: 'https://qubezip.online/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qubezip',
      url: 'https://qubezip.online',
    },
    datePublished: '2026-09-25',
    dateModified: '2026-09-25',
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Government & Career Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            How to Reduce PDF Size for Government & Civil Service Portals (&lt; 500KB &amp; 1MB)
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold border-b border-slate-200 pb-4">
            <span>By <strong>Qubezip Editorial Team</strong></span>
            <span>•</span>
            <span>Published: September 25, 2026</span>
            <span>•</span>
            <span>5 min read</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">✓ Portal Guidelines Verified</span>
          </div>
        </header>

        {/* Article Body */}
        <article className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              Applying for government civil service exams (เช่น สอบ ก.พ., ข้าราชการครู, รัฐวิสาหกิจ), university admissions (TCAS), or visa portals often requires submitting transcripts, house registrations, and certificates with rigid file limits—frequently capped at <strong>500KB</strong> or <strong>1MB</strong> per file.
            </p>
            <p>
              Exceeding the size limit results in rejection errors like <em>"File exceeds permitted size"</em>, while over-compressing can make signatures, national ID numbers, and official seals unreadable. This guide provides exact instructions to pass validation every time.
            </p>
          </section>

          {/* Table of Major Portal Limits */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-600" />
              <span>1. Standard File Size Limits by Organization</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-900 font-black">
                  <tr>
                    <th className="p-3.5 border-b border-slate-200">Organization / Portal</th>
                    <th className="p-3.5 border-b border-slate-200">Max Size Limit</th>
                    <th className="p-3.5 border-b border-slate-200">Recommended Qubezip Preset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">OCSC Civil Service (สอบ ก.พ. / ข้าราชการ)</td>
                    <td className="p-3.5 text-rose-600 font-bold">500 KB</td>
                    <td className="p-3.5"><Link href="/compress-pdf-to-500kb" className="text-blue-600 font-bold underline">500KB Mode</Link></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">University Admissions (TCAS / ทปอ.)</td>
                    <td className="p-3.5 text-rose-600 font-bold">1 MB - 2 MB</td>
                    <td className="p-3.5"><Link href="/compress-pdf-to-1mb" className="text-blue-600 font-bold underline">1MB Mode</Link></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Online Visa Applications (eVisa / Embassies)</td>
                    <td className="p-3.5 text-rose-600 font-bold">1 MB - 3 MB</td>
                    <td className="p-3.5"><Link href="/compress-pdf-to-1mb" className="text-blue-600 font-bold underline">1MB Mode</Link></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Corporate ATS & HR Recruitment</td>
                    <td className="p-3.5 text-rose-600 font-bold">2 MB - 5 MB</td>
                    <td className="p-3.5"><Link href="/compress-pdf-for-email" className="text-blue-600 font-bold underline">Email / 5MB Mode</Link></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Key Guidelines for Official Documents */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              <span>2. 4 Rules for Compressing Official Identification Records</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">1. Keep ID Numbers Sharp</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Ensure the 13-digit National ID number, name spelling, and date of birth remain 100% legible without compression artifacts.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">2. Preserve Official Seals & Stamps</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Do not downsample below 150 DPI so institutional red/blue ink seals remain verifiable by human evaluators.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">3. Single Multi-Page PDF</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  If required to combine front and back of ID or transcript pages into one document, optimize all pages together.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">4. Avoid Password Protection</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Automated upload portals will automatically reject password-encrypted PDF files. Remove passwords before uploading.
                </p>
              </div>
            </div>
          </section>

          {/* Step-by-Step Optimization */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              <span>3. How to Use Qubezip 500KB & 1MB Presets</span>
            </h2>

            <ol className="list-decimal list-inside space-y-3 font-medium">
              <li>
                Open the dedicated <Link href="/compress-pdf-to-500kb" className="text-blue-600 font-bold underline">500KB PDF Compressor</Link> or <Link href="/compress-pdf-to-1mb" className="text-blue-600 font-bold underline">1MB PDF Compressor</Link>.
              </li>
              <li>
                Drop your official scanned certificate or resume into the upload box.
              </li>
              <li>
                Click <em>"Compress PDF"</em>. The smart adaptive algorithm analyzes text vs image areas to guarantee the output size remains strictly under the threshold.
              </li>
              <li>
                Download and attach the output file directly to your application portal.
              </li>
            </ol>
          </section>

          {/* Privacy Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
                Zero Risk to Personal Identification
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                National IDs, bank account details, and transcripts processed on Qubezip are never transmitted to a server. Everything executes locally in your browser memory via WebAssembly.
              </p>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
