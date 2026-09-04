"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import Toast from "./Toast";

interface ShareQRModalProps {
  url: string;
  name: string;
  onClose: () => void;
}

export default function ShareQRModal({ url, name, onClose }: ShareQRModalProps) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fileBaseName = name.toLowerCase().replace(/\s+/g, "-");

  const downloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${fileBaseName}-anikod-qr.png`;
    link.click();
  };

  const downloadSvg = () => {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileBaseName}-anikod-qr.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setToast("Bağlantı kopyalandı.");
    } catch {
      setToast("Kopyalama başarısız oldu.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Karekodu Paylaş</h3>
            <p className="mt-0.5 text-xs text-stone-500">{name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <div ref={canvasWrapRef} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-inner">
            <QRCodeCanvas value={url} size={180} level="H" marginSize={2} />
          </div>
          {/* Ekranda görünmez — sadece SVG indirme için gizli bir kopya */}
          <div ref={svgWrapRef} className="hidden">
            <QRCodeSVG value={url} size={180} level="H" marginSize={2} />
          </div>
        </div>

        <button
          type="button"
          onClick={copyLink}
          className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-left transition-colors hover:bg-stone-100"
        >
          <span className="truncate font-mono text-xs text-stone-600">{url}</span>
          <svg
            className="h-4 w-4 shrink-0 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25"
            />
          </svg>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            PNG İndir
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            SVG İndir
          </button>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
