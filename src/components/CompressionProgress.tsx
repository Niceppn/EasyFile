'use client';

import { Loader2, Zap } from 'lucide-react';

interface CompressionProgressProps {
  progress: number;
  statusText: string;
}

export function CompressionProgress({ progress, statusText }: CompressionProgressProps) {
  return (
    <div className="bg-white rounded-3xl border border-blue-100 p-8 shadow-sm text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">
        กำลังบีบอัดขนาดไฟล์ PDF...
      </h3>
      <p className="text-sm text-slate-500 mb-6 font-medium">
        {statusText || 'กำลังประมวลผลโครงสร้าง PDF และบีบอัดรูปภาพในไฟล์...'}
      </p>

      {/* Progress Bar Container */}
      <div className="max-w-md mx-auto">
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 mt-2 px-1">
          <span className="flex items-center gap-1 text-blue-600">
            <Zap className="w-3.5 h-3.5 fill-current" /> ประมวลผลรวดเร็วบน Web Browser
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
