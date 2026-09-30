import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Email Attachment Size Limits for Gmail, Outlook & Yahoo (2026 Guide) - Qubezip',
  description:
    'Complete guide to email attachment size limits for Gmail, Outlook, Yahoo Mail, and Apple Mail, plus how to quickly compress PDF files under 5MB or 10MB to avoid delivery errors.',
};

export default function GuideEmailAttachmentLimits() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Email Attachment Size Limits for Gmail, Outlook & Yahoo (2026 Guide)',
    description:
      'A breakdown of maximum file sizes across major email providers and how to compress PDFs under 5MB or 10MB to avoid bounce-back delivery failures.',
    author: {
      '@type': 'Organization',
      name: 'Qubezip Productivity Team',
      url: 'https://qubezip.online/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qubezip',
      url: 'https://qubezip.online',
    },
    datePublished: '2026-09-10',
    dateModified: '2026-09-10',
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-extrabold border border-cyan-200">
            <Mail className="w-3.5 h-3.5 text-cyan-600" />
            <span>Email &amp; Productivity</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Email Attachment Size Limits for Gmail, Outlook &amp; Yahoo (2026 Guide)
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold border-b border-slate-200 pb-4">
            <span>By <strong>Qubezip Productivity Team</strong></span>
            <span>•</span>
            <span>Published: September 10, 2026</span>
            <span>•</span>
            <span>4 min read</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">✓ 2026 Email Provider Specs Verified</span>
          </div>
        </header>

        {/* Article Body */}
        <article className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Introduction */}
          <section className="space-y-4">
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
              Trying to send an important client proposal or job resume only to receive an instant bounce-back error: <em>"552 5.3.4 Message size exceeds fixed maximum message size"</em>?
            </p>
            <p>
              Email servers enforce hard size limits on attachments. Even worse, email protocols encode binary PDF files using <strong>MIME Base64 encoding</strong>, which increases actual payload transmission size by approximately <strong>33%</strong>!
            </p>
          </section>

          {/* Email Limits Comparison Table */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Send className="w-6 h-6 text-cyan-600" />
              <span>1. Maximum Attachment Limits by Email Provider</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-900 font-black">
                  <tr>
                    <th className="p-3.5 border-b border-slate-200">Email Provider</th>
                    <th className="p-3.5 border-b border-slate-200">Stated Attachment Limit</th>
                    <th className="p-3.5 border-b border-slate-200">Safe PDF Target Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Google Gmail</td>
                    <td className="p-3.5 text-rose-600 font-bold">25 MB</td>
                    <td className="p-3.5 font-bold text-emerald-600">Under 18 MB (Due to Base64)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Microsoft Outlook / Hotmail</td>
                    <td className="p-3.5 text-rose-600 font-bold">20 MB</td>
                    <td className="p-3.5 font-bold text-emerald-600">Under 15 MB</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Yahoo Mail</td>
                    <td className="p-3.5 text-rose-600 font-bold">25 MB</td>
                    <td className="p-3.5 font-bold text-emerald-600">Under 18 MB</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Apple iCloud Mail</td>
                    <td className="p-3.5 text-rose-600 font-bold">20 MB</td>
                    <td className="p-3.5 font-bold text-emerald-600">Under 15 MB</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-800">Corporate Enterprise Exchange Servers</td>
                    <td className="p-3.5 text-rose-600 font-bold">5 MB - 10 MB</td>
                    <td className="p-3.5 font-bold text-emerald-600">Under 3 MB - 5 MB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Why Target 5MB for Fast Delivery */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600" />
              <span>2. Why You Should Compress PDFs to Under 5MB for Email</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Fast Mobile Downloads</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Recipients opening your email on 4G/5G mobile phones will open a 3MB file instantly, whereas a 20MB file will lag and consume mobile data.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-1.5">
                <strong className="block text-slate-900 font-black">Bypass Strict Spam Filters</strong>
                <p className="text-xs sm:text-sm text-slate-600">
                  Enterprise email security gateways (Proofpoint, Mimecast) aggressively quarantine large unsolicited attachments. Compact files pass straight to the primary inbox.
                </p>
              </div>
            </div>
          </section>

          {/* Quick 1-Click Solution */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>3. How to Compress for Email with Qubezip</span>
            </h2>

            <p>
              Use our dedicated <Link href="/compress-pdf-for-email" className="text-blue-600 font-bold underline">Compress PDF for Email</Link> tool:
            </p>
            <ol className="list-decimal list-inside space-y-2 font-medium">
              <li>Upload your heavy report or presentation PDF.</li>
              <li>The email preset automatically balances image resolution and vector clarity to keep total file size under optimal email transmission thresholds.</li>
              <li>Download and attach directly to your email draft without fear of bounce-backs.</li>
            </ol>
          </section>

          {/* Call to Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Compress your PDF for email delivery now</p>
              <p className="text-xs text-slate-500">Free, fast, and 100% private in-browser tool.</p>
            </div>
            <Link
              href="/compress-pdf-for-email"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Compress for Email</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
