import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileText,
  QrCode,
  Image as ImageIcon,
  Mail,
  Scale,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'PDF & Document Guides Knowledge Hub - Qubezip',
  description:
    'Comprehensive guides and technical tutorials on PDF compression algorithms, document security standards, government upload limits, and QR code optimization.',
};

const guidesList = [
  {
    slug: 'how-to-compress-pdf-without-losing-quality',
    title: 'How to Compress PDF Without Losing Quality (Complete Technical Guide)',
    titleTh: 'วิธีบีบอัดไฟล์ PDF ไม่ให้รูปภาพและตัวหนังสือแตก สำหรับงานพิมพ์และส่งงาน',
    excerpt:
      'Learn how modern JPEG downsampling, FlateDecode vector stream compression, and font subsetting reduce PDF size by 80% while keeping text razor-sharp.',
    category: 'PDF Optimization',
    readTime: '6 min read',
    icon: Zap,
    color: 'from-blue-600 to-indigo-600',
    date: 'Sep 28, 2026',
  },
  {
    slug: 'reduce-pdf-size-for-government-portals',
    title: 'How to Reduce PDF File Size for Government & Civil Service Portals (< 500KB & 1MB)',
    titleTh: 'เทคนิคย่อไฟล์ PDF สำหรับอัปโหลดเว็บ ก.พ. / รับราชการ / สมัครงาน ไม่เกิน 500KB และ 1MB',
    excerpt:
      'Step-by-step instructions on formatting government job applications, OCSC resumes, and university admission documents under strict upload caps.',
    category: 'Government & Career',
    readTime: '5 min read',
    icon: Scale,
    color: 'from-emerald-600 to-teal-600',
    date: 'Sep 25, 2026',
  },
  {
    slug: 'secure-pdf-compression-client-side-vs-server',
    title: 'In-Browser Client-Side vs Server-Side PDF Processing: Privacy & Security Comparison',
    titleTh: 'ความปลอดภัยของเอกสาร: ทำไมการประมวลผลบนเบราว์เซอร์ (WebAssembly) ปลอดภัยกว่าอัปโหลดขึ้นเซิร์ฟเวอร์',
    excerpt:
      'Why uploading financial and legal documents to cloud converter servers introduces risk, and how local WebAssembly execution guarantees 100% zero-storage privacy.',
    category: 'Security & Privacy',
    readTime: '7 min read',
    icon: ShieldCheck,
    color: 'from-purple-600 to-indigo-600',
    date: 'Sep 22, 2026',
  },
  {
    slug: 'qr-code-best-practices-for-business',
    title: 'QR Code Best Practices for Business: Sizing, Contrast & Error Correction Levels',
    titleTh: 'คู่มือการสร้าง QR Code สำหรับธุรกิจ: ขนาด สี และการตั้งค่า Reed-Solomon ให้สแกนติดง่าย',
    excerpt:
      'Master Reed-Solomon error correction (L, M, Q, H), quiet zones, and vector export formats to ensure your QR codes scan instantly on all mobile cameras.',
    category: 'QR Technology',
    readTime: '6 min read',
    icon: QrCode,
    color: 'from-amber-600 to-orange-600',
    date: 'Sep 19, 2026',
  },
  {
    slug: 'how-to-extract-images-from-pdf-high-res',
    title: 'How to Extract and Convert PDF Pages to High-Resolution JPG & PNG (300 DPI)',
    titleTh: 'วิธีแปลงไฟล์ PDF เป็นภาพ JPG/PNG ความละเอียดสูง (300 DPI) คมชัดทุกรายละเอียด',
    excerpt:
      'Learn how raster rendering pipelines extract embedded photos and full-page spreads into crisp, lossless PNG and high-quality JPEG graphics.',
    category: 'Image Conversion',
    readTime: '5 min read',
    icon: ImageIcon,
    color: 'from-rose-600 to-pink-600',
    date: 'Sep 15, 2026',
  },
  {
    slug: 'pdf-email-attachment-size-limits-guide',
    title: 'Email Attachment Size Limits for Gmail, Outlook & Yahoo (And How to Compress for Email)',
    titleTh: 'สรุปขนาดไฟล์แนบอีเมลสูงสุดของ Gmail, Outlook, Yahoo และวิธีย่อไฟล์ส่งด่วน',
    excerpt:
      'A breakdown of maximum file sizes across major email providers and how to compress PDFs under 5MB or 10MB to avoid bounce-back delivery failures.',
    category: 'Email & Productivity',
    readTime: '4 min read',
    icon: Mail,
    color: 'from-cyan-600 to-blue-600',
    date: 'Sep 10, 2026',
  },
];

export default function GuidesHubPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold mb-4 border border-blue-200 shadow-2xs">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Qubezip Knowledge Hub & Technical Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Document Optimization & Security Guides
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-medium">
            In-depth tutorials, technical comparisons, and expert advice on PDF compression algorithms, client-side privacy, and digital document workflows.
          </p>
        </div>

        {/* Featured Editorial Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-16 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Technical Deep Dive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Why In-Browser WebAssembly is the Future of Document Security
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore how client-side compilation in modern browsers allows zero-server PDF compression, eliminating security risks while delivering instant conversion speeds.
            </p>
          </div>
          <Link
            href="/guides/secure-pdf-compression-client-side-vs-server"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span>Read Full Guide</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guidesList.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.slug}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group"
              >
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px]">
                        {guide.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {guide.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      <Link href={`/guides/${guide.slug}`}>{guide.title}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{guide.date}</span>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 group-hover:text-blue-700"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
