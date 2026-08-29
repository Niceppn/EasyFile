'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { FileUploader } from '@/components/FileUploader';
import { TargetSizeSelector } from '@/components/TargetSizeSelector';
import { CompressionProgress } from '@/components/CompressionProgress';
import { ResultCard } from '@/components/ResultCard';
import { FAQSection } from '@/components/FAQSection';
import { SEOContent } from '@/components/SEOContent';
import { LeftAdSidebar, RightAdSidebar } from '@/components/AdSidebars';
import { compressPdfToTargetSize, CompressionResult } from '@/lib/pdf-compressor';
import { Zap, Play } from 'lucide-react';

export default function CompressTo1MBPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSizeBytes, setTargetSizeBytes] = useState<number>(1 * 1024 * 1024);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [result, setResult] = useState<CompressionResult | null>(null);

  const handleStartCompression = async () => {
    if (!file) return;
    setIsCompressing(true);
    try {
      const res = await compressPdfToTargetSize(file, {
        targetSizeBytes,
        onProgress: (pct, msg) => {
          setProgress(pct);
          setStatusText(msg);
        },
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      <Header />

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex justify-center items-start gap-6">
        <LeftAdSidebar />

        <main className="flex-1 max-w-4xl w-full">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold mb-4 border border-blue-200">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Preset ขนาดเป้าหมาย: 1MB</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              บีบอัด PDF ให้เหลือไม่เกิน 1MB <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ภาพชัด ข้อความไม่แตก ฟรีออนไลน์
              </span>
            </h1>

            <p className="text-base text-slate-600 mt-4 leading-relaxed font-medium">
              ต้องยื่นเอกสารสมัครงานหรืออัปโหลดไฟล์ PDF เข้าระบบสมัครมหาลัยที่จำกัดขนาดไม่เกิน 1MB? ย่อขนาดไฟล์ของคุณได้ง่ายๆ ทันที
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {!result && !isCompressing && (
              <>
                <FileUploader file={file} onFileSelect={setFile} disabled={isCompressing} />
                <TargetSizeSelector
                  originalSizeBytes={file ? file.size : null}
                  targetSizeBytes={targetSizeBytes}
                  onTargetSizeChange={setTargetSizeBytes}
                  disabled={isCompressing}
                />
                {file && (
                  <button
                    type="button"
                    onClick={handleStartCompression}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Play className="w-5 h-5 inline mr-2 fill-current" />
                    <span>เริ่มบีบอัด PDF ให้เหลือไม่เกิน 1MB</span>
                  </button>
                )}
              </>
            )}

            {isCompressing && <CompressionProgress progress={progress} statusText={statusText} />}
            {result && (
              <ResultCard
                result={result}
                targetSizeBytes={targetSizeBytes}
                fileName={file?.name || 'document.pdf'}
                onReset={() => {
                  setFile(null);
                  setResult(null);
                }}
              />
            )}
          </div>

          <SEOContent title="บีบอัด PDF เหลือ 1MB" targetPresetText="ไม่เกิน 1MB" />
          <FAQSection />
        </main>

        <RightAdSidebar />
      </div>
    </div>
  );
}
