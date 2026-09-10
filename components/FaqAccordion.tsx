"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white shadow-sm dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/60"
            >
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {item.question}
              </span>
              <svg
                className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
