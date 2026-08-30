'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Copy, Download, QrCode as QrIcon, Check, Sliders, Palette, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function QrCodeGenerator() {
  const { t } = useLanguage();
  const [text, setText] = useState<string>('https://qubezip.online');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(500);
  const [margin, setMargin] = useState<number>(2);

  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Instant local canvas rendering for immediate UI feedback
  useEffect(() => {
    if (!text.trim()) {
      setDataUrl('');
      setErrorMsg('Please enter a valid link or message');
      return;
    }

    setErrorMsg(null);
    const canvas = canvasRef.current || document.createElement('canvas');

    QRCode.toCanvas(
      canvas,
      text,
      {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) {
          console.error(error);
          setErrorMsg('Error generating QR Code. Please check input text.');
          return;
        }

        const url = canvas.toDataURL('image/png');
        setDataUrl(url);
      }
    );
  }, [text, fgColor, bgColor, size, margin]);

  // Debounced Analytics Logging (Triggers only when user stops typing for 1.5 seconds)
  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 3) return;

    const timer = setTimeout(() => {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'qr_generate',
          status: 'success',
          details: trimmed, // Only logs the final complete URL/text after typing stops
        }),
      }).catch(() => {});
    }, 1500); // 1.5 seconds debounce delay

    return () => clearTimeout(timer);
  }, [text]);

  const handleCopyToClipboard = async () => {
    if (!dataUrl) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('Your browser does not support direct image copying. Please use download buttons.');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      alert('Failed to copy image to clipboard.');
    }
  };

  const handleDownload = (format: 'png' | 'jpeg' | 'webp' | 'svg') => {
    if (!text.trim()) return;

    if (format === 'svg') {
      QRCode.toString(
        text,
        {
          type: 'svg',
          margin: margin,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        },
        (err, svgString) => {
          if (err) return;
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          triggerDownload(url, `qrcode.${format}`);
        }
      );
    } else {
      const canvas = canvasRef.current || document.createElement('canvas');
      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

      if (format === 'jpeg') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      QRCode.toCanvas(
        canvas,
        text,
        {
          width: size,
          margin: margin,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: 'H',
        },
        () => {
          const url = canvas.toDataURL(mimeType, 0.95);
          triggerDownload(url, `qrcode.${format}`);
        }
      );
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Trust Guarantee Highlight Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed font-medium">
          <strong className="font-bold text-emerald-950 block mb-0.5">{t.qrTrustBoxTitle}</strong>
          {t.qrTrustBoxSub}
        </div>
      </div>

      {/* Input Section */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
          <QrIcon className="w-4 h-4 text-blue-600" />
          <span>{t.qrInputLabel} <span className="text-rose-500">*</span></span>
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. https://www.facebook.com"
          className="w-full px-4 py-4 rounded-2xl border border-slate-300 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-slate-50/50"
        />
        {errorMsg && (
          <p className="text-xs text-rose-600 mt-2 font-medium">{errorMsg}</p>
        )}
      </div>

      {/* Customization Options Grid */}
      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-200 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>{t.qrCustomTitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Foreground Color */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.qrFgColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{fgColor}</span>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.qrBgColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-xs font-mono font-semibold text-slate-700">{bgColor}</span>
            </div>
          </div>

          {/* Resolution Size */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              {t.qrRes}
            </label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
            >
              <option value={300}>300 x 300 px</option>
              <option value={500}>500 x 500 px (HD)</option>
              <option value={800}>800 x 800 px (4K Print)</option>
            </select>
          </div>
        </div>
      </div>

      {/* QR Code Preview & Actions Display */}
      {dataUrl && (
        <div className="flex flex-col items-center justify-center pt-2 space-y-6">
          <div className="p-5 bg-white rounded-3xl border-2 border-blue-100 shadow-md inline-block relative group text-center">
            <img
              src={dataUrl}
              alt="Generated QR Code"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
            />
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-current" />
              <span>{t.qrNoAdsBadge}</span>
            </div>
          </div>

          <div className="w-full max-w-lg space-y-3">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-md transition-all flex items-center justify-center gap-2.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>{t.btnCopiedSuccess}</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>{t.btnCopyClipboard}</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownload('png')}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{t.btnDownloadPng}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('jpeg')}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{t.btnDownloadJpeg}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('webp')}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>{t.btnDownloadWebp}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload('svg')}
                className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>{t.btnDownloadSvg}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
