'use client';

import { Download, RefreshCw, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { CompressionResult, formatBytes } from '@/lib/pdf-compressor';
import { useLanguage } from '@/lib/i18n/context';

interface ResultCardProps {
  result: CompressionResult;
  targetSizeBytes: number;
  fileName: string;
  onReset: () => void;
}

export function ResultCard({ result, targetSizeBytes, fileName, onReset }: ResultCardProps) {
  const { t } = useLanguage();
  const downloadFileName = fileName.replace(/\.pdf$/i, '') + `_compressed.pdf`;

  return (
    <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {t.resultSuccessTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {t.resultSuccessSub}
          </p>
        </div>
      </div>

      {/* Size Comparison Card */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center">
          {/* Original Size */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500 font-bold">{t.originalSize}</div>
            <div className="text-lg font-extrabold text-slate-800 mt-1">
              {formatBytes(result.originalSize)}
            </div>
          </div>

          {/* Arrow & Saved Badge */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200 mb-1">
              <span>{t.saved} {result.savingsPercentage}%</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 hidden sm:block" />
          </div>

          {/* Compressed Size */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-xs text-emerald-700 font-bold">{t.newSize}</div>
            <div className="text-xl font-black text-emerald-900 mt-1">
              {formatBytes(result.compressedSize)}
            </div>
          </div>
        </div>

        {/* Target Match Note */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>{t.targetMatchNote} <strong>{formatBytes(targetSizeBytes)}</strong> <span className="text-slate-400 font-normal">{t.targetMatchVariance}</span></span>
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <Info className="w-4 h-4 text-emerald-600" />
            {t.keepSharpness}
          </span>
        </div>
      </div>

      {/* Download Action & Reset */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={result.pdfUrl}
          download={downloadFileName}
          className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.99] text-center text-base"
        >
          <Download className="w-5 h-5" />
          <span>{t.btnDownloadPdf}</span>
        </a>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.btnCompressAnother}</span>
        </button>
      </div>
    </div>
  );
}
