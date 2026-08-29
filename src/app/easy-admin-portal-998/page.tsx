'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Users,
  FileText,
  Image as ImageIcon,
  QrCode,
  Globe,
  Building2,
  Mail,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface StatsData {
  totalEvents: number;
  pageViews: number;
  compressPdf: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
  pdfToImage: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
  qrGenerate: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
  countryBreakdown: {
    country: string;
    count: number;
    percentage: number;
  }[];
  recentQrEvents?: {
    id: string;
    url: string;
    country: string;
    timestamp: string;
  }[];
  recentCompressEvents?: {
    id: string;
    fileName: string;
    originalSize: string;
    compressedSize: string;
    savedPercent: number;
    country: string;
    status: string;
    timestamp: string;
  }[];
  recentPdfToImageEvents?: {
    id: string;
    fileName: string;
    pageCount: number;
    format: string;
    country: string;
    status: string;
    timestamp: string;
  }[];
  inquiries: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    message: string;
    timestamp: string;
  }[];
  security?: {
    totalLogs: number;
    suspectedAttacks: number;
    highFrequencyLogs: number;
    topTargetedPaths: { path: string; count: number }[];
    recentLogs: {
      id: string;
      ip: string;
      country: string;
      path: string;
      method: string;
      userAgent: string;
      threatLevel: 'NORMAL' | 'HIGH_FREQUENCY' | 'SUSPECTED_ATTACK';
      timestamp: string;
    }[];
  };
}

function CountryFlagBadge({ country }: { country: string }) {
  const flags: Record<string, string> = {
    TH: '🇹🇭',
    JP: '🇯🇵',
    US: '🇺🇸',
    FR: '🇫🇷',
    DE: '🇩🇪',
    ES: '🇪🇸',
    CN: '🇨🇳',
    GB: '🇬🇧',
    RU: '🇷🇺',
  };
  return <span className="mr-1.5">{flags[country] || '🌐'}</span>;
}

export default function EasyAdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchStats();
      } else {
        setLoginError('รหัสผ่านไม่ถูกต้อง (Invalid Admin Password)');
      }
    } catch (err) {
      setLoginError('เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน');
    }
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              EasyFile Admin Gate
            </h1>
            <p className="text-xs text-slate-400">
              พื้นที่สำหรับผู้ดูแลระบบเท่านั้น กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>รหัสผ่านเข้าสู่ระบบ (Admin Password)</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg transition-all"
            >
              เข้าสู่ระบบหลังบ้าน
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                <span>EasyFile Security & Control Center</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Secret Route
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                ระบบตรวจจับ IP เฝ้าระวังการยิง Server รายการบีบอัด PDF, แปลงรูปภาพ, QR Code และสถิติ Real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchStats}
              disabled={isLoadingStats}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-bold flex items-center gap-2 border border-slate-700"
              title="อัปเดตข้อมูลล่าสุด"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">รีเฟรชข้อมูล</span>
            </button>

            <button
              type="button"
              onClick={() => {
                document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setIsAuthenticated(false);
              }}
              className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors text-xs font-bold flex items-center gap-1.5 border border-rose-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">ผู้เข้าชม / กิจกรรมรวม</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {stats?.totalEvents.toLocaleString() || 0}
            </div>
            <div className="text-[11px] text-slate-400">
              ยอดสะสมทั้งหมดในระบบ
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">การบีบอัด PDF</span>
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {stats?.compressPdf.total.toLocaleString() || 0}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold">
              ความสำเร็จ: {stats?.compressPdf.successRate || 100}%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">แปลง PDF เป็นภาพ</span>
              <ImageIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {stats?.pdfToImage.total.toLocaleString() || 0}
            </div>
            <div className="text-[11px] text-indigo-400 font-bold">
              ความสำเร็จ: {stats?.pdfToImage.successRate || 100}%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">สร้าง QR Code</span>
              <QrCode className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {stats?.qrGenerate.total.toLocaleString() || 0}
            </div>
            <div className="text-[11px] text-amber-400 font-bold">
              ความสำเร็จ: {stats?.qrGenerate.successRate || 100}%
            </div>
          </div>
        </div>

        {/* 📄 NEW SECTION: Recent PDF Compression Activity Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                รายการบีบอัด PDF ล่าสุด (Recent PDF Compression Activity)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              รวม {stats?.recentCompressEvents?.length || 0} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">เวลาบีบอัด</th>
                  <th className="py-3 px-3">ประเทศ</th>
                  <th className="py-3 px-3">ชื่อไฟล์ PDF</th>
                  <th className="py-3 px-3">ขนาดเดิม</th>
                  <th className="py-3 px-3">ขนาดใหม่</th>
                  <th className="py-3 px-3 text-right">ประหยัดพื้นที่ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {stats?.recentCompressEvents && stats.recentCompressEvents.length > 0 ? (
                  stats.recentCompressEvents.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(c.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                        <CountryFlagBadge country={c.country} />
                        <span>{c.country}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-200 max-w-xs truncate">
                        {c.fileName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono">
                        {c.originalSize}
                      </td>
                      <td className="py-3.5 px-3 text-emerald-400 font-mono font-bold">
                        {c.compressedSize}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          -{c.savedPercent}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      ยังไม่มีรายการบีบอัด PDF เข้ามาในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🖼️ NEW SECTION: Recent PDF to Image Activity Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                รายการแปลง PDF เป็นภาพล่าสุด (Recent PDF to Image Activity)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              รวม {stats?.recentPdfToImageEvents?.length || 0} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">เวลาแปลงไฟล์</th>
                  <th className="py-3 px-3">ประเทศ</th>
                  <th className="py-3 px-3">ชื่อไฟล์ PDF</th>
                  <th className="py-3 px-3">จำนวนหน้าทั้งหมด</th>
                  <th className="py-3 px-3 text-right">นามสกุลภาพที่แปลง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {stats?.recentPdfToImageEvents && stats.recentPdfToImageEvents.length > 0 ? (
                  stats.recentPdfToImageEvents.map((img) => (
                    <tr key={img.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(img.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                        <CountryFlagBadge country={img.country} />
                        <span>{img.country}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-200 max-w-xs truncate">
                        {img.fileName}
                      </td>
                      <td className="py-3.5 px-3 text-indigo-400 font-bold">
                        {img.pageCount} หน้า
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono">
                          .{img.format}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      ยังไม่มีรายการแปลง PDF เป็นภาพเข้ามาในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🔗 Recent Generated QR Code Target Links & Paths */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                รายการลิงก์ / Path ที่ผู้ใช้สร้าง QR Code ล่าสุด (Generated QR Code Links)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              รวม {stats?.recentQrEvents?.length || 0} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">เวลาที่สร้าง</th>
                  <th className="py-3 px-3">ประเทศผู้สร้าง</th>
                  <th className="py-3 px-3">ลิงก์ / ข้อความเป้าหมาย (Target Link / Path)</th>
                  <th className="py-3 px-3 text-right">เปิดลิงก์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {stats?.recentQrEvents && stats.recentQrEvents.length > 0 ? (
                  stats.recentQrEvents.map((qr) => (
                    <tr key={qr.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(qr.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                        <CountryFlagBadge country={qr.country} />
                        <span>{qr.country}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-amber-300 font-bold max-w-md truncate">
                        {qr.url}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {qr.url.startsWith('http') ? (
                          <a
                            href={qr.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 text-xs font-bold transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>เปิดดู</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px]">ข้อความทั่วไป</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      ยังไม่มีรายการสร้าง QR Code เข้ามาในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🛡️ Server Security & IP Attack Monitor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>ระบบตรวจจับ IP และเฝ้าระวังการยิง Server (IP & Threat Monitor)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ติดตาม IP Address, ประเทศต้นทาง, เส้นทาง (Path) ที่ถูกเข้าถึง และตรวจจับการยิงข้อมูลถี่ผิดปกติ
                </p>
              </div>
            </div>

            {stats?.security && stats.security.suspectedAttacks > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/40 animate-pulse">
                <AlertCircle className="w-4 h-4" />
                <span>พบการยิงข้อมูลสแกนสุ่ม {stats.security.suspectedAttacks} รายการ</span>
              </div>
            )}
          </div>

          {/* Top Targeted Paths Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-slate-400 font-bold mb-1">การเรียกดูทั้งหมด</div>
              <div className="text-2xl font-black text-white">
                {stats?.security?.totalLogs.toLocaleString() || 0} Requests
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-amber-400 font-bold mb-1">ความถี่สูงผิดปกติ (High Frequency)</div>
              <div className="text-2xl font-black text-amber-400">
                {stats?.security?.highFrequencyLogs.toLocaleString() || 0} Requests
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-rose-400 font-bold mb-1">พยายามสแกนเจาะระบบ / ยิง Server</div>
              <div className="text-2xl font-black text-rose-400">
                {stats?.security?.suspectedAttacks.toLocaleString() || 0} Alerts
              </div>
            </div>
          </div>

          {/* IP Security Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">เวลาที่เข้าถึง</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">ประเทศ</th>
                  <th className="py-3 px-3">เส้นทางเป้าหมาย (Target Path)</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">ระดับความเสี่ยง (Threat Level)</th>
                  <th className="py-3 px-3 text-right">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {stats?.security?.recentLogs && stats.security.recentLogs.length > 0 ? (
                  stats.security.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{log.ip}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyIp(log.ip)}
                            className="p-1 rounded text-slate-500 hover:text-slate-300"
                            title="คัดลอก IP"
                          >
                            {copiedIp === log.ip ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        <CountryFlagBadge country={log.country} />
                        <span>{log.country}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-400 font-bold max-w-xs truncate">
                        {log.path}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {log.method}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {log.threatLevel === 'SUSPECTED_ATTACK' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            🚨 SUSPECTED ATTACK
                          </span>
                        ) : log.threatLevel === 'HIGH_FREQUENCY' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            🟡 HIGH FREQUENCY
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            🟢 NORMAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 max-w-xs truncate font-mono text-[11px]">
                        {log.userAgent}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      กำลังรวบรวมข้อมูล Log การเข้าถึง...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Country Distribution & Feature Rates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Country Distribution Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">
                  สัดส่วนผู้ใช้แยกตามประเทศ (Country Breakdown)
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {stats?.countryBreakdown && stats.countryBreakdown.length > 0 ? (
                stats.countryBreakdown.map((cb) => (
                  <div key={cb.country} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300 flex items-center">
                        <CountryFlagBadge country={cb.country} />
                        {cb.country}
                      </span>
                      <span className="text-slate-400">
                        {cb.count} ครั้ง ({cb.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, cb.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  ยังไม่มีข้อมูลผู้เข้าชมจากต่างประเทศ
                </p>
              )}
            </div>
          </div>

          {/* Feature Success Rate Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  สถิติความสำเร็จฟีเจอร์ (Feature Performance)
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">บีบอัด PDF (PDF Compressor)</span>
                  <span className="text-emerald-400">{stats?.compressPdf.successRate}% Success</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stats?.compressPdf.successRate || 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">แปลง PDF เป็นภาพ (PDF to Image)</span>
                  <span className="text-indigo-400">{stats?.pdfToImage.successRate}% Success</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${stats?.pdfToImage.successRate || 100}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-200">สร้าง QR Code (QR Generator)</span>
                  <span className="text-amber-400">{stats?.qrGenerate.successRate}% Success</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${stats?.qrGenerate.successRate || 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Ad Inquiry Leads Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">
                รายชื่อผู้ติดต่อโฆษณา (Ad Inquiry Leads)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              รวม {stats?.inquiries.length || 0} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">เวลาที่ติดต่อ</th>
                  <th className="py-3 px-3">ผู้ติดต่อ / แบรนด์</th>
                  <th className="py-3 px-3">อีเมล</th>
                  <th className="py-3 px-3">เบอร์โทร / Line ID</th>
                  <th className="py-3 px-3">รายละเอียดข้อความ</th>
                  <th className="py-3 px-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {stats?.inquiries && stats.inquiries.length > 0 ? (
                  stats.inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(inq.timestamp).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">
                        <div>{inq.name}</div>
                        <div className="text-[11px] text-blue-400 font-semibold">{inq.company}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {inq.email}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {inq.phone}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                        {inq.message || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <a
                          href={`mailto:${inq.email}?subject=ตอบกลับผู้สนใจลงโฆษณาบน EasyFile (${inq.company})`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>ตอบกลับ</span>
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      ยังไม่มีรายการผู้ติดต่อโฆษณาเข้ามาในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
