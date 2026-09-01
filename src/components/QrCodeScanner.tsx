'use client';

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import jsQR from 'jsqr';
import { BrowserQRCodeReader } from '@zxing/library';
import { useLanguage } from '@/lib/i18n/context';
import {
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react';

export function QrCodeScanner() {
  const { t } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanningLaser, setIsScanningLaser] = useState<boolean>(false);
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zxingReaderRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    try {
      zxingReaderRef.current = new BrowserQRCodeReader();
    } catch (e) {}
  }, []);

  // Fast Binarization Threshold on Canvas
  const applyBinarizationOnCanvas = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    threshold = 128
  ) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg >= threshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imgData, 0, 0);
  };

  // Synchronous + ZXing Fallback QR Engine
  const decodeQrFromImage = async (img: HTMLImageElement): Promise<string | null> => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    // Multi-scale passes (1.0x, 2.0x upscale for small Snipping Tool images, 0.6x downscale for 4K)
    const scales = [1.0];
    if (origW < 800 && origH < 800) scales.push(2.0);
    if (origW > 1200 || origH > 1200) scales.push(800 / Math.max(origW, origH));
    if (origW > 500 || origH > 500) scales.push(450 / Math.max(origW, origH));

    const reader = zxingReaderRef.current;

    for (const scale of scales) {
      const w = Math.round(origW * scale);
      const h = Math.round(origH * scale);

      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, w, h);

      // Pass 1: Raw Canvas Data jsQR
      const rawData = ctx.getImageData(0, 0, w, h);
      const jsQrCode = jsQR(rawData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (jsQrCode && jsQrCode.data) {
        return jsQrCode.data;
      }

      // Pass 2: ZXing on full canvas directly
      if (reader) {
        try {
          const zCanvasResult = await reader.decodeFromCanvas(canvas);
          if (zCanvasResult && zCanvasResult.getText()) {
            return zCanvasResult.getText();
          }
        } catch (e) {}
      }

      // Pass 3: Comprehensive Sub-Region Crops (To strip top speech bubbles like "ประกาศรับสมัคร" & L-brackets)
      const cropBoxes = [
        // Cut top 35% (Strips "ประกาศรับสมัคร" speech bubble completely)
        { x: Math.round(w * 0.05), y: Math.round(h * 0.35), cw: Math.round(w * 0.9), ch: Math.round(h * 0.65) },
        // Cut top 25%
        { x: 0, y: Math.round(h * 0.25), cw: w, ch: Math.round(h * 0.75) },
        // Center 70% x 70%
        { x: Math.round(w * 0.15), y: Math.round(h * 0.3), cw: Math.round(w * 0.7), ch: Math.round(h * 0.65) },
        // Center 60% x 60% (Ultra-tight QR matrix crop)
        { x: Math.round(w * 0.2), y: Math.round(h * 0.35), cw: Math.round(w * 0.6), ch: Math.round(h * 0.6) },
      ];

      for (const box of cropBoxes) {
        if (box.cw < 30 || box.ch < 30) continue;

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = box.cw;
        cropCanvas.height = box.ch;
        const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
        if (!cropCtx) continue;

        cropCtx.imageSmoothingEnabled = false;
        cropCtx.drawImage(img, box.x / scale, box.y / scale, box.cw / scale, box.ch / scale, 0, 0, box.cw, box.ch);
        const cropImageData = cropCtx.getImageData(0, 0, box.cw, box.ch);

        // jsQR on Crop
        const cropJsQr = jsQR(cropImageData.data, box.cw, box.ch, { inversionAttempts: 'attemptBoth' });
        if (cropJsQr && cropJsQr.data) {
          return cropJsQr.data;
        }

        // ZXing on Crop
        if (reader) {
          try {
            const zCropResult = await reader.decodeFromCanvas(cropCanvas);
            if (zCropResult && zCropResult.getText()) {
              return zCropResult.getText();
            }
          } catch (e) {}
        }

        // Binarized Crop Canvas jsQR
        applyBinarizationOnCanvas(cropCtx, box.cw, box.ch, 128);
        const binarizedCropJsQr = jsQR(cropCtx.getImageData(0, 0, box.cw, box.ch).data, box.cw, box.ch, { inversionAttempts: 'attemptBoth' });
        if (binarizedCropJsQr && binarizedCropJsQr.data) {
          return binarizedCropJsQr.data;
        }

        // ZXing on Binarized Crop Canvas
        if (reader) {
          try {
            const zBinarizedResult = await reader.decodeFromCanvas(cropCanvas);
            if (zBinarizedResult && zBinarizedResult.getText()) {
              return zBinarizedResult.getText();
            }
          } catch (e) {}
        }
      }
    }

    // Fallback: ZXing on original image element
    if (reader) {
      try {
        const zResult = await reader.decodeFromImageElement(img);
        if (zResult && zResult.getText()) {
          return zResult.getText();
        }
      } catch (e) {}
    }

    return null;
  };

  // Main Handler for pasted or uploaded files
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg(t.qrReaderError || 'Please select a valid image file');
      return;
    }

    setErrorMsg(null);
    setDecodedData(null);
    setIsScanningLaser(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = async () => {
        const startTime = Date.now();

        // Wrap decoding with a strict 1000ms safety timeout
        const timeoutPromise = new Promise<string | null>((res) => setTimeout(() => res(null), 1000));
        const decodedText = await Promise.race([decodeQrFromImage(img), timeoutPromise]);

        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(0, 400 - elapsedTime);

        setTimeout(() => {
          setIsScanningLaser(false);
          if (decodedText) {
            setDecodedData(decodedText);
            setErrorMsg(null);

            // Track QR Code scan event in admin analytics
            try {
              fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'qr_generate',
                  status: 'success',
                  details: `[READ QR] ${decodedText}`,
                }),
              }).catch(() => {});
            } catch (e) {}
          } else {
            setDecodedData(null);
            setErrorMsg(
              t.qrReaderError ||
                'ไม่พบข้อมูล QR Code ในรูปภาพนี้ กรุณาครอบรูปเฉพาะ QR Code หรือใช้รูปภาพอื่นที่มี QR Code ชัดเจน'
            );
          }
        }, remainingDelay);
      };
      img.onerror = () => {
        setIsScanningLaser(false);
        setErrorMsg(t.qrReaderError || 'Error loading image');
      };
      img.src = dataUrl;
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
    setImagePreview(null);
    setDecodedData(null);
    setErrorMsg(null);
    setIsScanningLaser(false);
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

      {/* Main Upload / Drag & Drop / Ctrl+V Paste Box */}
      {!imagePreview && (
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
              <QrCode className="w-8 h-8 text-blue-600" />
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

      {/* Image Preview & Scanning Laser Beam Container */}
      {imagePreview && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700">
            {isScanningLaser ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span className="text-blue-600 font-bold">กำลังสแกนอ่าน QR Code...</span>
              </>
            ) : decodedData ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-black">✓ สแกนสำเร็จ สรุปภาพและลิงก์เรียบร้อย</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-600 font-bold">ผลการสแกนรูปภาพ</span>
              </>
            )}
          </div>

          {/* Pasted Image Preview Card with Animated Scanning Laser Sweep */}
          <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-900 group">
            <img
              src={imagePreview}
              alt="Pasted QR Code Preview"
              className="w-full max-h-72 object-contain mx-auto block"
            />

            {/* Glowing Laser Scan Beam Animation Line */}
            {isScanningLaser && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399,0_0_30px_#10b981] animate-[scanLine_0.8s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-emerald-500/20 to-transparent animate-[pulse_0.8s_infinite]" />
              </div>
            )}
          </div>

          {/* Decoded QR Code Result Details Box */}
          {decodedData && (
            <div className="space-y-4 text-left border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{t.qrReaderResultTitle || 'ลิงก์ / ข้อความที่ได้จาก QR Code:'}</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500">ประเภท: QR Code</span>
              </div>

              {/* Decoded Target Link Display Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-amber-300 font-mono text-xs sm:text-sm break-all border border-slate-800 shadow-inner select-all">
                {decodedData}
              </div>

              {/* Action Buttons: Open Link in New Tab & Copy Link */}
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

          {/* Error Alert inside Image Preview State */}
          {errorMsg && (
            <div className="space-y-4 text-left border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold shadow-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span className="flex-1">{errorMsg}</span>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {t.qrReaderScanAnother || 'สแกนภาพอื่นใหม่'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Laser Scanning CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes scanLine {
          0% {
            top: 0%;
          }
          50% {
            top: 96%;
          }
          100% {
            top: 0%;
          }
        }
      `}</style>
    </div>
  );
}
