'use client';

import Link from 'next/link';
import { Megaphone, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { GoogleAdUnit } from '@/components/GoogleAdUnit';

export function LeftAdSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col items-center justify-start w-40 sm:w-48 sticky top-28 bg-white border border-slate-200 rounded-3xl p-3 shadow-xs flex-shrink-0">
      <div className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
        {t.adTitle}
      </div>
      <GoogleAdUnit slot="7020030411" format="auto" />
      <div className="w-full mt-2 pt-2 border-t border-slate-100 text-center">
        <Link
          href="/contact-advertising"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
        >
          <PlusCircle className="w-3 h-3" />
          <span>{t.adBtn}</span>
        </Link>
      </div>
    </aside>
  );
}

export function RightAdSidebar() {
  const { t } = useLanguage();

  return (
    <aside className="hidden xl:flex flex-col items-center justify-start w-40 sm:w-48 sticky top-28 bg-white border border-slate-200 rounded-3xl p-3 shadow-xs flex-shrink-0">
      <div className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
        {t.adTitle}
      </div>
      <GoogleAdUnit slot="7020030411" format="auto" />
      <div className="w-full mt-2 pt-2 border-t border-slate-100 text-center">
        <Link
          href="/contact-advertising"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
        >
          <PlusCircle className="w-3 h-3" />
          <span>{t.adBtn}</span>
        </Link>
      </div>
    </aside>
  );
}

export function MobileAdBanner() {
  const { t } = useLanguage();

  return (
    <div className="xl:hidden w-full my-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {t.adTitle}
        </div>
        <GoogleAdUnit slot="7020030411" format="auto" />
      </div>
    </div>
  );
}
