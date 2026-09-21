import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Lock, Eye, Cookie, FileText, Globe, ServerOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Qubezip',
  description:
    'Privacy Policy for Qubezip. Learn how we protect your document privacy with 100% client-side in-browser processing, zero server storage, and Google AdSense cookie disclosures.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-4 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Data Protection Commitment</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3">
            Last Updated: September 21, 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Highlights Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 mb-10 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
              <ServerOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-950">
                Core Guarantee: 100% In-Browser Local Processing
              </h2>
              <p className="text-sm text-emerald-900 mt-1 leading-relaxed">
                Qubezip is designed with a <strong>Zero-Server-Upload Architecture</strong>. When you compress PDF files, convert PDF pages to images, or scan QR codes, all computations run entirely within your local browser memory using WebAssembly and HTML5 Canvas. Your sensitive files and documents are <strong>NEVER transmitted to or stored on our servers</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10 text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Lock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-black">1. Information We Do NOT Collect</h2>
            </div>
            <p className="text-sm sm:text-base">
              Because Qubezip operates entirely on the client-side:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base space-y-1.5 pl-2">
              <li>We do <strong>not</strong> upload, view, read, store, or copy your PDF files, document text, or images.</li>
              <li>We do <strong>not</strong> collect personal financial, medical, or corporate records contained within your files.</li>
              <li>Files processed in your session are immediately discarded from browser memory once you close or reload the browser tab.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <Cookie className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-black">2. Cookies & Advertising (Google AdSense)</h2>
            </div>
            <p className="text-sm sm:text-base">
              We partner with third-party advertising vendors, including Google LLC, to serve advertisements when you visit our website.
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base space-y-2 pl-2">
              <li>
                <strong>Google AdSense & DoubleClick DART Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites on the Internet.
              </li>
              <li>
                Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-bold"
                >
                  Google Ads Settings
                </a>{' '}
                or via the Network Advertising Initiative opt-out page at{' '}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-bold"
                >
                  aboutads.info
                </a>.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-black">3. Analytics & Aggregated Performance Data</h2>
            </div>
            <p className="text-sm sm:text-base">
              To monitor platform stability, detect automated bot abuse, and optimize compression speed, we collect minimal, anonymized aggregated metrics such as:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base space-y-1.5 pl-2">
              <li>Browser type, operating system, and preferred language code (e.g., EN, TH, JA).</li>
              <li>Aggregated event counters (e.g., total successful compression tasks performed).</li>
              <li>Approximate country-level geographic location determined via Cloudflare edge headers without recording exact GPS coordinates.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black">4. Compliance with GDPR, CCPA, and PDPA</h2>
            </div>
            <p className="text-sm sm:text-base">
              Whether you are located in the European Economic Area (EEA), California (USA), Thailand, or globally, Qubezip adheres to international privacy principles:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base space-y-1.5 pl-2">
              <li><strong>Right to Data Minimization:</strong> We never collect unnecessary personal data.</li>
              <li><strong>Right of Erasure / Deletion:</strong> Since no user files are saved on servers, there is no personal document footprint to delete.</li>
              <li><strong>No Sale of Personal Data:</strong> We do not sell, rent, or trade your personal information to third parties.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5 text-slate-600" />
              <h2 className="text-xl font-black">5. Contact Information</h2>
            </div>
            <p className="text-sm sm:text-base">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our security practices, please contact us at:
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm font-semibold space-y-1">
              <p><strong>Website:</strong> https://qubezip.online</p>
              <p><strong>Contact Page:</strong> <a href="/contact-advertising" className="text-blue-600 underline">https://qubezip.online/contact-advertising</a></p>
              <p><strong>Email:</strong> support@qubezip.online</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
