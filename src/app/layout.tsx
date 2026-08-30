import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Qubezip - บีบอัด PDF กำหนดขนาดได้ & สร้าง QR Code ฟรี",
    template: "%s | Qubezip",
  },
  description:
    "เครื่องมือบีบอัด PDF ออนไลน์ กำหนดขนาดได้ตามต้องการ (1MB, 500KB) ปลอดภัย 100% ประมวลผลบนเบราว์เซอร์ พร้อมระบบสร้าง QR Code ฟรี ลิงก์ตรง ไม่มีโฆษณา",
  keywords: ["บีบอัด PDF", "บีบอัด PDF 1MB", "บีบอัด PDF 500KB", "สร้าง QR Code", "QR Code ฟรี", "Qubezip"],
  icons: {
    icon: "/logo.png?v=2",
    shortcut: "/logo.png?v=2",
    apple: "/logo.png?v=2",
  },
  other: {
    "google-adsense-account": "ca-pub-4042640078267186",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden max-w-full`}
    >
      <head>
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4042640078267186"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden max-w-full bg-slate-50 text-slate-900">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
