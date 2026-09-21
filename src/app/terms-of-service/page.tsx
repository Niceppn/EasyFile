import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Scale, CheckCircle2, AlertTriangle, Copyright, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Qubezip',
  description:
    'Terms of Service and Conditions of Use for Qubezip. Learn about permitted use, user responsibilities, intellectual property, and service limitations.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold mb-4 border border-blue-200">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Legal Agreement & Terms of Use</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3">
            Last Updated: September 21, 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10 text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-black">1. Acceptance of Terms</h2>
            </div>
            <p className="text-sm sm:text-base">
              By accessing and using Qubezip (https://qubezip.online), you agree to be bound by these Terms of Service, our Privacy Policy, and all applicable local and international laws. If you do not agree with any part of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-black">2. Description of Service & Permitted Use</h2>
            </div>
            <p className="text-sm sm:text-base">
              Qubezip provides free client-side document processing utilities including PDF compression, PDF-to-image extraction, and QR code generation/reading. You may use our services for personal, educational, or commercial purposes subject to the following rules:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base space-y-1.5 pl-2">
              <li>You may not use the service to process materials that infringe upon copyright, trademarks, or intellectual property rights of others.</li>
              <li>You may not launch Denial-of-Service (DoS) attacks, scrape automated endpoints maliciously, or attempt to compromise infrastructure security.</li>
              <li>You acknowledge that file conversion operations execute locally in your web browser.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <Copyright className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-black">3. Intellectual Property Rights & Document Ownership</h2>
            </div>
            <p className="text-sm sm:text-base">
              <strong>Your Files Belong to You:</strong> You retain 100% of all rights, title, and interest in and to any PDF files, documents, or graphics processed via Qubezip. We claim no intellectual property rights or ownership over your content.
            </p>
            <p className="text-sm sm:text-base">
              <strong>Platform Assets:</strong> The Qubezip brand, logo, user interface design, CSS styling, domain name, and software code are the intellectual property of Qubezip and protected by copyright laws.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-black">4. Disclaimer of Warranties & Limitation of Liability</h2>
            </div>
            <p className="text-sm sm:text-base">
              Qubezip is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express or implied. While we employ rigorous optimization algorithms to minimize quality degradation, we do not guarantee that file compression will meet arbitrary size thresholds or that document rendering will be error-free across all non-standard PDF formats.
            </p>
            <p className="text-sm sm:text-base">
              In no event shall Qubezip or its developers be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or inability to use the service.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-2 text-slate-900">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-black">5. Changes to Terms & Governing Law</h2>
            </div>
            <p className="text-sm sm:text-base">
              We reserve the right to modify or replace these Terms of Service at any time. Your continued use of the website following any changes constitutes acceptance of the updated terms. These terms are governed by and construed in accordance with applicable laws.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
