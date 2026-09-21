'use client';

import Link from 'next/link';
import { ShieldCheck, Zap, QrCode, FileText, Image as ImageIcon, Sparkles, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function LeftAdSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col items-stretch justify-start w-48 sticky top-28 bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex-shrink-0 space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Pro PDF Tips</span>
      </div>

      <div className="space-y-3 text-left">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Upload</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            All files are compressed inside your browser memory.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700">
            <Zap className="w-3.5 h-3.5" />
            <span>Fast Presets</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Use 1MB or 500KB modes for instant portal compliance.
          </p>
        </div>
      </div>

      <div className="pt-1 border-t border-slate-100">
        <Link
          href="/compress-pdf-to-1mb"
          className="text-[11px] font-black text-blue-600 hover:text-blue-700 flex items-center justify-between group"
        >
          <span>1MB PDF Preset</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>
    </aside>
  );
}

export function RightAdSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col items-stretch justify-start w-48 sticky top-28 bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex-shrink-0 space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
        <QrCode className="w-4 h-4 text-blue-600" />
        <span>Popular Tools</span>
      </div>

      <div className="space-y-2 text-left text-xs">
        <Link
          href="/qr-code-generator"
          className="block p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors"
        >
          <div className="font-bold text-slate-900">QR Code Studio</div>
          <div className="text-[10px] text-slate-500">Create & Scan QR Codes</div>
        </Link>

        <Link
          href="/pdf-to-image"
          className="block p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors"
        >
          <div className="font-bold text-slate-900">PDF to Images</div>
          <div className="text-[10px] text-slate-500">Extract JPG / PNG pages</div>
        </Link>

        <Link
          href="/compress-pdf-for-email"
          className="block p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors"
        >
          <div className="font-bold text-slate-900">Email Optimized</div>
          <div className="text-[10px] text-slate-500">Under 5MB attachments</div>
        </Link>
      </div>

      <div className="pt-1 border-t border-slate-100">
        <Link
          href="/about"
          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-between"
        >
          <span>About Qubezip</span>
          <span>→</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileAdBanner() {
  const { t } = useLanguage();

  return (
    <div className="xl:hidden w-full my-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 shadow-xs text-left flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Client-Side Privacy</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Your PDF files never leave your device. Zero server upload.
          </p>
        </div>
        <Link
          href="/privacy-policy"
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex-shrink-0"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
