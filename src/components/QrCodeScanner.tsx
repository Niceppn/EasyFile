'use client';

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import jsQR from 'jsqr';
import { useLanguage } from '@/lib/i18n/context';
import {
  Upload,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  ShieldCheck,
  FileImage,
} from 'lucide-react';

export function QrCodeScanner() {
  const { t } = useLanguage();
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pastedPreview, setPastedPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Decode QR Code from an HTMLImageElement
  const processImageElement = (img: HTMLImageElement) => {
    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setErrorMsg(t.qrReaderError || 'Failed to initialize canvas');
        setIsScanning(false);
        return;
      }

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        setDecodedData(code.data);
        setErrorMsg(null);
        // Track QR Code scan event in admin analytics
        try {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'QR_GENERATE',
              status: 'SUCCESS',
              url: `SCANNED: ${code.data}`,
            }),
          }).catch(() => {});
        } catch (e) {}
      } else {
        setDecodedData(null);
        setErrorMsg(t.qrReaderError || 'No valid QR code found in this image.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t.qrReaderError || 'Failed to process image');
    } finally {
      setIsScanning(false);
    }
  };

  // Process File Object
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(t.qrReaderError || 'Please select a valid image file');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPastedPreview(result);
      const img = new Image();
      img.onload = () => processImageElement(img);
      img.onerror = () => {
        setErrorMsg(t.qrReaderError || 'Error loading image');
        setIsScanning(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste (Ctrl+V) listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyLink = () => {
    if (!decodedData) return;
    navigator.clipboard.writeText(decodedData);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleReset = () => {
    setDecodedData(null);
    setErrorMsg(null);
    setPastedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUrl = decodedData?.startsWith('http://') || decodedData?.startsWith('https://');

  return (
    <div className="w-full space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Upload / Paste Box */}
      {!decodedData && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-200">
              {isScanning ? (
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              ) : (
                <QrCode className="w-8 h-8 text-blue-600" />
              )}
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {t.qrReaderDragTitle || 'ลากและวางภาพ QR Code ที่นี่'}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                {t.uploaderBrowse || 'คลิกเพื่อเลือกไฟล์'} (PNG, JPG, WEBP)
              </p>
            </div>

            {/* Ctrl+V Paste Hint Banner */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs">
              <ClipboardCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t.qrReaderPasteHint || 'หรือกด Ctrl+V วางภาพถ่ายหน้าจอ QR Code ได้ทันที'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors"
          >
            {t.btnCompressAnother || 'ลองใหม่'}
          </button>
        </div>
      )}

      {/* Decoded QR Code Result Card */}
      {decodedData && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t.qrReaderResultTitle || 'ลิงก์ / ข้อความที่ถอดรหัสได้จาก QR Code'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  100% Client-Side Decoded • Zero Server Storage
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ ถอดรหัสสำเร็จ
            </span>
          </div>

          {/* Decoded Data Display Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-amber-300 font-mono text-sm sm:text-base break-all border border-slate-800 shadow-inner select-all">
            {decodedData}
          </div>

          {/* Action Buttons: Open in New Tab & Copy Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {isUrl && (
              <a
                href={decodedData}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.qrReaderOpenTab || 'เปิดลิงก์ในแท็บใหม่ (Open in New Tab)'}</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>
                {isCopied
                  ? (t.qrReaderCopied || 'คัดลอกเรียบร้อย!')
                  : (t.qrReaderCopy || 'คัดลอกลิงก์ (Copy Link)')}
              </span>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-blue-600 underline cursor-pointer"
            >
              {t.qrReaderScanAnother || 'สแกนรูปภาพอื่นเพิ่ม'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
