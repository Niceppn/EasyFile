'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: t.faq1Q,
      answer: t.faq1A,
    },
    {
      question: t.faq2Q,
      answer: t.faq2A,
    },
    {
      question: t.faq3Q,
      answer: t.faq3A,
    },
    {
      question: t.faq4Q,
      answer: t.faq4A,
    },
    {
      question: t.faq5Q,
      answer: t.faq5A,
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {t.faqTitle}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-150"
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full p-5 text-left font-bold text-slate-800 hover:text-blue-600 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-base"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="p-5 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
