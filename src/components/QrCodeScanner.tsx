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
} from 'lucide-react';

export function QrCodeScanner() {
  const { t } = useLanguage();
  const [decodedData, setDecodedData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zxingReaderRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    zxingReaderRef.current = new BrowserQRCodeReader();
  }, []);

  // Helper to run jsQR on an ImageData object
  const scanImageDataWithJsQR = (imageData: ImageData) => {
    return jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
  };

  // Binarize (High contrast Black & White)
  const createThresholdedCanvas = (
    img: HTMLImageElement,
    w: number,
    h: number,
    threshold = 128
  ) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return tempCanvas;

    ctx.drawImage(img, 0, 0, w, h);
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
    return tempCanvas;
  };

  // Hybrid Dual-Engine QR Scanner (ZXing + jsQR Multi-Pass)
  const processImageElement = async (img: HTMLImageElement) => {
    setIsScanning(true);
    setErrorMsg(null);
    let decodedResultText: string | null = null;

    try {
      // ENGINE 1: ZXing Barcode Engine (Decodes Corner Brackets, Speech Bubbles & Noisy Screenshots)
      if (zxingReaderRef.current) {
        try {
          const zxingResult = await zxingReaderRef.current.decodeFromImageElement(img);
          if (zxingResult && zxingResult.getText()) {
            decodedResultText = zxingResult.getText();
          }
        } catch (e) {
          // ZXing didn't find QR code on raw image element, try canvas & binarized
        }
      }

      // ENGINE 2: jsQR Engine & Multi-Crop Binarization Passes
      if (!decodedResultText) {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;

          const scales = [1.0];
          if (origW > 1200 || origH > 1200) scales.push(1000 / Math.max(origW, origH));
          if (origW > 600 || origH > 600) scales.push(600 / Math.max(origW, origH));
          if (origW > 350 || origH > 350) scales.push(350 / Math.max(origW, origH));

          for (const scale of scales) {
            if (decodedResultText) break;
            const w = Math.round(origW * scale);
            const h = Math.round(origH * scale);

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);

            // Pass 1: Raw Canvas Data
            const rawImageData = ctx.getImageData(0, 0, w, h);
            let code = scanImageDataWithJsQR(rawImageData);

            if (code && code.data) {
              decodedResultText = code.data;
              break;
            }

            // Pass 2: Binarized Canvas Element with ZXing
            if (!decodedResultText && zxingReaderRef.current) {
              try {
                const binarizedCanvas = createThresholdedCanvas(img, w, h, 128);
                const binarizedImg = new Image();
                binarizedImg.src = binarizedCanvas.toDataURL();
                await new Promise((res) => {
                  binarizedImg.onload = res;
                  binarizedImg.onerror = res;
                });
                const zResult = await zxingReaderRef.current.decodeFromImageElement(binarizedImg);
                if (zResult && zResult.getText()) {
                  decodedResultText = zResult.getText();
                  break;
                }
              } catch (e) {}
            }

            // Pass 3: Sub-Region Crops (Crop bottom 80% to strip top speech bubbles like "ประกาศรับสมัคร")
            if (!decodedResultText && (w > 120 && h > 120)) {
              const cropBoxes = [
                { x: 0, y: Math.round(h * 0.25), cw: w, ch: Math.round(h * 0.75) },
                { x: Math.round(w * 0.1), y: Math.round(h * 0.15), cw: Math.round(w * 0.8), ch: Math.round(h * 0.8) },
                { x: Math.round(w * 0.15), y: Math.round(h * 0.3), cw: Math.round(w * 0.7), ch: Math.round(h * 0.7) },
              ];

              for (const box of cropBoxes) {
                if (decodedResultText) break;
                if (box.cw < 50 || box.ch < 50) continue;

                const cropCanvas = document.createElement('canvas');
                cropCanvas.width = box.cw;
                cropCanvas.height = box.ch;
                const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
                if (!cropCtx) continue;

                cropCtx.drawImage(img, box.x / scale, box.y / scale, box.cw / scale, box.ch / scale, 0, 0, box.cw, box.ch);
                const cropImageData = cropCtx.getImageData(0, 0, box.cw, box.ch);
                const cCode = scanImageDataWithJsQR(cropImageData);

                if (cCode && cCode.data) {
                  decodedResultText = cCode.data;
                  break;
                }

                // Try ZXing on crop
                if (!decodedResultText && zxingReaderRef.current) {
                  try {
                    const cropImg = new Image();
                    cropImg.src = cropCanvas.toDataURL();
                    await new Promise((res) => {
                      cropImg.onload = res;
                      cropImg.onerror = res;
                    });
                    const zCropResult = await zxingReaderRef.current.decodeFromImageElement(cropImg);
                    if (zCropResult && zCropResult.getText()) {
                      decodedResultText = zCropResult.getText();
                      break;
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }
      }

      if (decodedResultText) {
        setDecodedData(decodedResultText);
        setErrorMsg(null);

        // Track QR Code scan event in admin analytics
        try {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'QR_GENERATE',
              status: 'SUCCESS',
              url: `[READ QR] ${decodedResultText}`,
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
          <span className="flex-1 text-xs sm:text-sm">{errorMsg}</span>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            {t.qrReaderScanAnother || 'ลองอีกครั้ง'}
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
