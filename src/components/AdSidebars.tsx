'use client';

import Link from 'next/link';
import { Megaphone, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function LeftAdSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col items-center justify-center w-36 sm:w-44 h-[550px] sticky top-28 bg-slate-100 hover:bg-slate-200/80 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-3xl p-4 transition-all group cursor-pointer text-center flex-shrink-0 shadow-inner">
      <Link href="/contact-advertising" className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 flex items-center justify-center transition-colors">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-600 group-hover:text-blue-700 block uppercase tracking-wider">
            {t.adTitle}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 mt-1 block">
            {t.adSub}
          </span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full shadow-sm group-hover:shadow transition-all">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t.adBtn}</span>
        </div>
      </Link>
    </aside>
  );
}

export function RightAdSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col items-center justify-center w-36 sm:w-44 h-[550px] sticky top-28 bg-slate-100 hover:bg-slate-200/80 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-3xl p-4 transition-all group cursor-pointer text-center flex-shrink-0 shadow-inner">
      <Link href="/contact-advertising" className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 flex items-center justify-center transition-colors">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-black text-slate-600 group-hover:text-blue-700 block uppercase tracking-wider">
            {t.adTitle}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 mt-1 block">
            {t.adSub}
          </span>
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-full shadow-sm group-hover:shadow transition-all">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t.adBtn}</span>
        </div>
      </Link>
    </aside>
  );
}
