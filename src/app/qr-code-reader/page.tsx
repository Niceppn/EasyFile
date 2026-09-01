'use client';

import { Header } from '@/components/Header';
import { QrCodeScanner } from '@/components/QrCodeScanner';
import { FAQSection } from '@/components/FAQSection';
import { SEOContent } from '@/components/SEOContent';
import { LeftAdSidebar, RightAdSidebar, MobileAdBanner } from '@/components/AdSidebars';
import { useLanguage } from '@/lib/i18n/context';
import { QrCode, ShieldCheck, Copy, ExternalLink, Sparkles } from 'lucide-react';

export default function QrCodeReaderLandingPage() {
  const { t } = useLanguage();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Qubezip - อ่าน QR Code จากรูปภาพ ออนไลน์ (Online QR Code Reader)',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    description:
      'เครื่องมืออ่าน QR Code ออนไลน์ ปลดล็อกอ่านลิงก์จากรูปภาพ QR Code โดยไม่ต้องใช้มือถือสแกน ถอดรหัสทันที ปลอดภัย 100% เปิดลิงก์ในแท็บใหม่ได้ใน 1 คลิก',
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex justify-center items-start gap-6">
        <LeftAdSidebar />

        <main className="flex-1 max-w-4xl w-full">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-extrabold mb-4 border border-blue-200">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>อ่าน QR Code ออนไลน์ (Online QR Code Reader) • 100% Free</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              อ่าน QR Code จากรูปภาพ ออนไลน์ <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                ถอดรหัสข้อความและลิงก์ตรง 100%
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-medium">
              ไขข้อสงสัยรูปภาพ QR Code ว่าซ่อนลิงก์อะไรไว้! อัปโหลดไฟล์รูปภาพหรือวางภาพจาก Clipboard อ่านลิงก์ได้ทันที พร้อมเปิดเข้าชมเว็บเป้าหมายในแท็บใหม่
            </p>
          </div>

          {/* Core Scanner Tool */}
          <div className="max-w-3xl mx-auto">
            <QrCodeScanner />
          </div>

          <MobileAdBanner />
          <SEOContent />
          <FAQSection />
        </main>

        <RightAdSidebar />
      </div>

      <footer className="bg-white border-t border-slate-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          <p>{t.footerRights}</p>
        </div>
      </footer>
    </div>
  );
}
