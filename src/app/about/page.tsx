import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sparkles, ShieldCheck, Zap, Cpu, Heart, CheckCircle2, Award, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Qubezip Mission & Technology',
  description:
    'About Qubezip. Learn about our mission to make PDF compression and document utilities 100% private, free, and blazingly fast with client-side WebAssembly technology.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold mb-4 border border-blue-200 shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Empowering Privacy-First Productivity</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About Qubezip
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Qubezip was founded on a simple belief: <strong>Document productivity tools should be fast, completely free, and never compromise your privacy.</strong>
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Zero Server Upload</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike legacy PDF compressors that send your tax forms and bank statements to remote cloud servers, Qubezip computes everything locally inside your web browser.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Sub-Second Speed</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Powered by modern WebAssembly and Canvas pipelines, files compress instantly without queue times, file upload bottlenecks, or artificial waiting rooms.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">100% Free Forever</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No hidden paywalls, no file count limits, and no email registration requirements. Tools designed for everyday students, job applicants, and professionals.
            </p>
          </div>
        </div>

        {/* Detailed Story & Architecture */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed mb-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-600" />
              <span>Our Technology Architecture</span>
            </h2>
            <p className="text-sm sm:text-base">
              Traditional online converters are built around costly server-side processing queues where files must be uploaded over network connections, processed in Docker containers, and stored temporarily in cloud buckets. This model creates security risks and delays.
            </p>
            <p className="text-sm sm:text-base">
              Qubezip engineers a modern client-first paradigm. Leveraging <strong>PDF.js</strong>, <strong>PDF-Lib</strong>, <strong>jsQR</strong>, and high-performance WebAssembly, your computer’s CPU handles the mathematical rasterization and vector compression directly in memory.
            </p>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-600" />
              <span>Quality Standards & Integrity</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="block text-slate-900">Government & Job Portals</strong>
                  <span>Optimized preset profiles for Thai Civil Service (OCSC), university admissions, and HR recruitment portals.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="block text-slate-900">Cross-Platform Compatibility</strong>
                  <span>Designed to work seamlessly on macOS, Windows, Linux, iOS Safari, and Android Chrome.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>Contact & Community Support</span>
            </h2>
            <p className="text-sm sm:text-base">
              Have suggestions for new features, partnership opportunities, or feedback? We love hearing from our users worldwide!
            </p>
            <div className="pt-2">
              <a
                href="/contact-advertising"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all"
              >
                <span>Get in Touch with Our Team</span>
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
