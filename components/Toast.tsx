"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

/**
 * Sade, tek satırlık geri bildirim balonu. Global bir context/provider
 * gerektirmez — her client component kendi `useState<string | null>`
 * ile bunu tetikler. Otomatik kapanır, dışarıdan da kapatılabilir.
 */
export default function Toast({ message, onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
        <svg
          className="h-4 w-4 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        {message}
      </div>
    </div>
  );
}
