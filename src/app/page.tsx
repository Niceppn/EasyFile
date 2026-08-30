'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FileUploader } from '@/components/FileUploader';
import { TargetSizeSelector } from '@/components/TargetSizeSelector';
import { CompressionProgress } from '@/components/CompressionProgress';
import { ResultCard } from '@/components/ResultCard';
import { FAQSection } from '@/components/FAQSection';
import { SEOContent } from '@/components/SEOContent';
import { LeftAdSidebar, RightAdSidebar, MobileAdBanner } from '@/components/AdSidebars';
import { compressPdfToTargetSize, CompressionResult, formatBytes } from '@/lib/pdf-compressor';
import { useLanguage } from '@/lib/i18n/context';
import { Zap, Play, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [targetSizeBytes, setTargetSizeBytes] = useState<number>(1 * 1024 * 1024); // Default 1MB
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track page view event silently on mount
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'page_view', status: 'success' }),
    }).catch(() => {});
  }, []);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setResult(null);
    setErrorMsg(null);
  };

  const handleStartCompression = async () => {
    if (!file) return;

    setIsCompressing(true);
    setProgress(5);
    setStatusText('Initializing PDF engine...');
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await compressPdfToTargetSize(file, {
        targetSizeBytes,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusText(msg);
        },
      });

      setResult(res);

      // Track detailed compression activity for Admin Log
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'compress_pdf',
          status: 'success',
          details: JSON.stringify({
            fileName: file.name,
            originalSizeFormatted: formatBytes(res.originalSize),
            compressedSizeFormatted: formatBytes(res.compressedSize),
            savedPercent: res.savingsPercentage,
          }),
        }),
      }).catch(() => {});
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to compress PDF file. Please try another file.');

      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'compress_pdf',
          status: 'error',
          details: JSON.stringify({ fileName: file?.name || 'unknown.pdf' }),
        }),
      }).catch(() => {});
    } finally {
      setIsCompressing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      <Header />

      {/* Main Layout Container with Left & Right Ad Sidebars */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex justify-center items-start gap-6">
        <LeftAdSidebar />

        <main className="flex-1 max-w-4xl w-full">
          {/* Main Hero & Title */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-extrabold mb-4 border border-blue-200">
              <Zap className="w-4 h-4 fill-current text-blue-600" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t.heroTitleLine1} <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                {t.heroTitleLine2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed font-medium">
              {t.heroSub}
            </p>
          </div>

          {/* Core Tool Card */}
          <div className="max-w-2xl mx-auto space-y-6">
            {!result && !isCompressing && (
              <>
                <FileUploader
                  file={file}
                  onFileSelect={handleFileSelect}
                  disabled={isCompressing}
                />

                <TargetSizeSelector
                  originalSizeBytes={file ? file.size : null}
                  targetSizeBytes={targetSizeBytes}
                  onTargetSizeChange={(bytes) => setTargetSizeBytes(bytes)}
                  disabled={isCompressing}
                />

                {file && (
                  <button
                    type="button"
                    onClick={handleStartCompression}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{t.btnCompress} {formatBytes(targetSizeBytes)}</span>
                  </button>
                )}

                {errorMsg && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </>
            )}

            {isCompressing && (
              <CompressionProgress progress={progress} statusText={statusText} />
            )}

            {result && (
              <ResultCard
                result={result}
                targetSizeBytes={targetSizeBytes}
                fileName={file?.name || 'document.pdf'}
                onReset={handleReset}
              />
            )}
          </div>

            {/* Mobile Ad Banner */}
            <MobileAdBanner />

            {/* SEO & FAQ Content */}
            <SEOContent />
            <FAQSection />
          </main>

          <RightAdSidebar />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 space-y-2 font-medium">
          <p>{t.footerRights}</p>
          <p className="text-slate-400">{t.footerPrivacy}</p>
        </div>
      </footer>
    </div>
  );
}
