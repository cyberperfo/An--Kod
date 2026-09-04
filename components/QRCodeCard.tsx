"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeCardProps {
  url: string;
  name: string;
}

export default function QRCodeCard({ url, name }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${name.toLowerCase().replace(/\s+/g, "-")}-anikod.png`;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
      <div ref={qrRef} className="rounded-xl border border-stone-100 p-3 bg-white shadow-inner">
        <QRCodeCanvas
          value={url}
          size={180}
          level="H"
          marginSize={2}
        />
      </div>

      <div className="text-center">
        <p className="text-xs font-mono text-stone-400 break-all max-w-[220px]">
          {url}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 cursor-pointer"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
        QR Kodu İndir (PNG)
      </button>
    </div>
  );
}