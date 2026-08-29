'use client';

import { useState } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { CompressionProgress } from '@/components/CompressionProgress';
import { convertPdfToImages, PdfToImageResult } from '@/lib/pdf-to-image';
import { useLanguage } from '@/lib/i18n/context';
import { Image as ImageIcon, Download, Sparkles, Sliders, CheckCircle2, RefreshCw, AlertCircle, Play } from 'lucide-react';

export function PdfToImageConverter() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [dpiScale, setDpiScale] = useState<number>(2.0); // 1.5 = 150 DPI, 2.5 = 300 DPI

  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [result, setResult] = useState<PdfToImageResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartConversion = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(5);
    setStatusText('กำลังเริ่มต้นระบบแปลง PDF เป็นรูปภาพ...');
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await convertPdfToImages(file, {
        format,
        scale: dpiScale,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusText(msg);
        },
      });

      setResult(res);

      // Track detailed analytics event for Admin Log
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pdf_to_image',
          status: 'success',
          details: JSON.stringify({
            fileName: file.name,
            pageCount: res.pages.length,
            format: format.toUpperCase(),
          }),
        }),
      }).catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'ไม่สามารถแปลงไฟล์ PDF ได้ กรุณาลองใช้อีกไฟล์');

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pdf_to_image',
          status: 'error',
          details: JSON.stringify({ fileName: file?.name || 'unknown.pdf' }),
        }),
      }).catch(() => {});
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadZip = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(result.zipBlob);
    a.download = result.zipFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {!result && !isConverting && (
        <div className="space-y-6">
          {/* File Upload Box */}
          <FileUploader
            file={file}
            onFileSelect={(selected) => {
              setFile(selected);
              setErrorMsg(null);
            }}
            disabled={isConverting}
          />

          {/* Options & Format Selector Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.pdfImgOptionsTitle}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Image Format Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.pdfImgFormatLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('jpeg')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                      format === 'jpeg'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    .JPEG
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                      format === 'png'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    .PNG
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('webp')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                      format === 'webp'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    .WEBP
                  </button>
                </div>
              </div>

              {/* DPI Resolution Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.pdfImgDpiLabel}
                </label>
                <select
                  value={dpiScale}
                  onChange={(e) => setDpiScale(Number(e.target.value))}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value={1.5}>{t.pdfImgDpiStandard}</option>
                  <option value={2.5}>{t.pdfImgDpiHigh}</option>
                </select>
              </div>
            </div>

            {/* Action Convert Button */}
            {file && (
              <button
                type="button"
                onClick={handleStartConversion}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2.5"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t.btnStartConvertPdfImg} (.{format.toUpperCase()})</span>
              </button>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isConverting && (
        <CompressionProgress progress={progress} statusText={statusText} />
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {t.pdfImgSuccessTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.pdfImgPagesCount} <strong className="text-emerald-700 font-extrabold">{result.pages.length} {t.pagesText}</strong>
                </p>
              </div>
            </div>

            {/* Top Download ZIP & Reset Actions */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDownloadZip}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{t.btnDownloadAllZip}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                title="Convert Another File"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Converted Page Preview Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.pages.map((pg) => (
              <div
                key={pg.pageNum}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 aspect-[3/4] flex items-center justify-center overflow-hidden">
                  <img
                    src={pg.dataUrl}
                    alt={`Page ${pg.pageNum}`}
                    className="max-h-full w-auto object-contain rounded shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-700">
                    หน้า {pg.pageNum} / {result.pages.length}
                  </span>

                  <a
                    href={pg.dataUrl}
                    download={pg.fileName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs border border-slate-200 hover:border-blue-200 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.btnDownloadSinglePage}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
