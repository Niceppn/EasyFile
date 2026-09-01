'use client';

import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { QrCodeScanner } from '@/components/QrCodeScanner';
import { FAQSection } from '@/components/FAQSection';
import { SEOContent } from '@/components/SEOContent';
import { LeftAdSidebar, RightAdSidebar, MobileAdBanner } from '@/components/AdSidebars';
import { useLanguage } from '@/lib/i18n/context';
import { ScanLine, ShieldCheck, Copy, ExternalLink, Sparkles } from 'lucide-react';

export default function ScanQrCodeLandingPage() {
  const { t } = useLanguage();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Qubezip - สแกน QR Code จากรูปภาพ ออนไลน์ (Scan QR Code from Image)',
    operatingSystem: 'All',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'THB',
    },
    description:
      'สแกน QR Code จากรูปภาพออนไลน์ ถอดรหัสอ่านลิงก์จากภาพถ่ายหน้าจอ หรือไฟล์ภาพ PNG/JPG รองรับการลากวางและกด Ctrl+V วางภาพ ประมวลผลบนเครื่อง 100% ปลอดภัย ไร้โฆษณา',
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-extrabold mb-4 border border-emerald-200">
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>สแกน QR Code จากรูปภาพ ออนไลน์ • 100% Client-Side Safe</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              สแกน QR Code จากรูปภาพ ออนไลน์ <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                ถอดรหัสเปิดลิงก์ทันที ไม่ต้องโหลดแอป
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-medium">
              อัปโหลด ลากและวางไฟล์ภาพ หรือกด <code className="bg-slate-200 px-2 py-0.5 rounded text-slate-800 font-bold">Ctrl+V</code> วางภาพถ่ายหน้าจอ QR Code ระบบจะทำการสแกนอ่านลิงก์เป้าหมายทันที 100% บนเบราว์เซอร์ของคุณ พร้อมปุ่มกดเปิดลิงก์ในแท็บใหม่ทันที
            </p>
          </div>

          {/* Core Scanner Tool */}
          <div className="max-w-3xl mx-auto">
            <QrCodeScanner />
          </div>

          {/* SEO Feature Matrix Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                สแกน QR Code บนคอม & มือถือ
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                ไม่ต้องใช้กล้องถ่ายรูป! เพียงแคปหน้าจอภาพ QR Code แล้วกด Ctrl+V วางบนเว็บ Qubezip อ่านลิงก์ได้ทันทีใน 0 วินาที
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 font-bold">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                เปิดลิงก์เป้าหมายในแท็บใหม่
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                ถอดรหัสอ่าน URL จาก QR Code แล้วสามารถกดปุ่ม "เปิดลิงก์ในแท็บใหม่" เพื่อเปิดเข้าชมเว็บไซต์เป้าหมายได้อย่างรวดเร็ว
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                ปลอดภัย 100% ถอดรหัสบนเครื่อง
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                รูปภาพและข้อมูล QR Code ทั้งหมดถูกถอดรหัสภายในเครื่องของคุณโดยตรง ผ่าน WebAssembly ไม่มีการบันทึกภาพขึ้นเซิร์ฟเวอร์
              </p>
            </div>
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
