'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { ShieldCheck, Heart, FileText, Image as ImageIcon, QrCode, Mail, Globe, Lock } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Privacy Guarantee */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-black text-xl tracking-tight">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base shadow-sm">
                Q
              </span>
              <span>Qubezip</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast, free, and 100% private document productivity tools. All processing runs locally inside your browser with zero server uploads.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>

          {/* Column 2: Document & PDF Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-xs uppercase tracking-wider">PDF Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Compress PDF Online</span>
                </Link>
              </li>
              <li>
                <Link href="/compress-pdf-to-1mb" className="hover:text-white transition-colors">
                  Compress PDF to 1MB
                </Link>
              </li>
              <li>
                <Link href="/compress-pdf-to-500kb" className="hover:text-white transition-colors">
                  Compress PDF to 500KB
                </Link>
              </li>
              <li>
                <Link href="/compress-pdf-for-email" className="hover:text-white transition-colors">
                  Compress PDF for Email
                </Link>
              </li>
              <li>
                <Link href="/pdf-to-image" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>PDF to JPG / PNG</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: QR Code & Utilities */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-xs uppercase tracking-wider">QR Code Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/qr-code-generator" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>QR Code Generator</span>
                </Link>
              </li>
              <li>
                <Link href="/scan-qr-code" className="hover:text-white transition-colors">
                  Scan QR Code Online (Image)
                </Link>
              </li>
              <li>
                <Link href="/qr-code-reader" className="hover:text-white transition-colors">
                  QR Code Reader & Decoder
                </Link>
              </li>
              <li>
                <Link href="/contact-advertising" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contact & Advertising</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-white font-black text-xs uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy (GDPR / CCPA)</span>
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Qubezip Mission
                </Link>
              </li>
              <li>
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ad Settings & Cookies</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} Qubezip. All rights reserved. Zero-server document conversion.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
