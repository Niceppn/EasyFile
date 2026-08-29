'use client';

import { useState } from 'react';
import { Target, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { formatBytes } from '@/lib/pdf-compressor';
import { useLanguage } from '@/lib/i18n/context';

interface TargetSizeSelectorProps {
  originalSizeBytes: number | null;
  targetSizeBytes: number;
  onTargetSizeChange: (bytes: number) => void;
  disabled?: boolean;
}

export function TargetSizeSelector({
  originalSizeBytes,
  targetSizeBytes,
  onTargetSizeChange,
  disabled = false,
}: TargetSizeSelectorProps) {
  const { t } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(targetSizeBytes);
  const [customValue, setCustomValue] = useState<string>('1');
  const [customUnit, setCustomUnit] = useState<'MB' | 'KB'>('MB');

  const presets = [
    { label: '500 KB', bytes: 500 * 1024, tag: t.presetWeb },
    { label: '1 MB', bytes: 1 * 1024 * 1024, tag: t.presetJob },
    { label: '2 MB', bytes: 2 * 1024 * 1024, tag: t.presetEmail },
    { label: '5 MB', bytes: 5 * 1024 * 1024, tag: t.presetHigh },
  ];

  const handlePresetSelect = (bytes: number) => {
    setSelectedPreset(bytes);
    onTargetSizeChange(bytes);
  };

  const handleCustomChange = (val: string, unit: 'MB' | 'KB') => {
    setCustomValue(val);
    setCustomUnit(unit);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const multiplier = unit === 'MB' ? 1024 * 1024 : 1024;
      const bytes = Math.round(num * multiplier);
      setSelectedPreset('custom');
      onTargetSizeChange(bytes);
    }
  };

  const isTargetLargerThanOriginal =
    originalSizeBytes && targetSizeBytes >= originalSizeBytes;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.targetTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.targetSub}
            </p>
          </div>
        </div>

        {targetSizeBytes > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.targetBudget} {formatBytes(targetSizeBytes)}</span>
          </div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {presets.map((preset) => {
          const isSelected = selectedPreset === preset.bytes;
          return (
            <button
              key={preset.label}
              type="button"
              disabled={disabled}
              onClick={() => handlePresetSelect(preset.bytes)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 relative ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 text-blue-900 font-bold shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-sm font-bold">{preset.label}</div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                {preset.tag}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Size Input */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>{t.customSizeLabel}</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.1"
              max="200"
              step="0.1"
              disabled={disabled}
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value, customUnit)}
              className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-center"
              placeholder="e.g. 750"
            />

            <select
              value={customUnit}
              disabled={disabled}
              onChange={(e) =>
                handleCustomChange(customValue, e.target.value as 'MB' | 'KB')
              }
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="MB">MB</option>
              <option value="KB">KB</option>
            </select>
          </div>
        </div>

        {/* User Notice about ± variance */}
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span>{t.varianceNotice}</span>
        </div>

        {isTargetLargerThanOriginal && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{t.targetLargerWarning}</span>
          </div>
        )}
      </div>
    </div>
  );
}
