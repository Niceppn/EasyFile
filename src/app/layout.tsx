import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "EasyFile - บีบอัด PDF กำหนดขนาดได้ & สร้าง QR Code ฟรี",
    template: "%s | EasyFile",
  },
  description:
    "เครื่องมือย่อขนาดไฟล์ PDF เลือกขนาดไฟล์เป้าหมายได้ตามต้องการ และสร้าง QR Code ฟรีออนไลน์ ไม่มีโฆษณาคั่น ปลอดภัย 100%",
  keywords: ["บีบอัด PDF", "บีบอัด PDF 1MB", "บีบอัด PDF 500KB", "สร้าง QR Code", "QR Code ฟรี", "EasyFile"],
  icons: {
    icon: "/logo.png?v=2",
    shortcut: "/logo.png?v=2",
    apple: "/logo.png?v=2",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
