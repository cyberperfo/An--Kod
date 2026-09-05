"use client";

import { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

interface QRCodeCardProps {
  url: string;
  name: string;
}

export default function QRCodeCard({ url, name }: QRCodeCardProps) {
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cleanFileName = name.toLowerCase().trim().replace(/\s+/g, "-");

  // Vektörel SVG İndir (Lazer Kesim, Metal Plaka ve Matbaa için)
  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = `${cleanFileName}-anikod-vektorel.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  };

  // 1024x1024 Yüksek Kalite PNG İndir (300 DPI Net Baskı için)
  const downloadHighResPNG = () => {
    if (!canvasRef.current) return;
    setDownloading(true);

    const canvas = canvasRef.current;
    const pngUrl = canvas.toDataURL("image/png");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${cleanFileName}-anikod-baski-300dpi.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setDownloading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
      {/* Arka planda yüksek çözünürlüklü PNG üreten gizli Canvas */}
      <div className="hidden">
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={1024}
          level="H"
          marginSize={2}
        />
      </div>

      {/* Ön yüzde görünen Vektörel QR */}
      <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-4 shadow-inner">
        <QRCodeSVG
          ref={svgRef}
          value={url}
          size={180}
          level="H"
          marginSize={2}
          className="h-auto max-w-full"
        />
      </div>

      <div className="text-center">
        <p className="text-xs font-mono text-stone-400 break-all max-w-[240px]">
          {url}
        </p>
      </div>

      {/* İndirme Butonları */}
      <div className="flex w-full flex-col gap-2 sm:max-w-[240px]">
        <button
          type="button"
          onClick={downloadSVG}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 cursor-pointer shadow-sm"
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
          Vektörel İndir (.SVG)
        </button>

        <button
          type="button"
          onClick={downloadHighResPNG}
          disabled={downloading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 cursor-pointer"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Yüksek Kalite (.PNG)
        </button>
      </div>

      <p className="text-[11px] text-stone-400 text-center">
        * Metal plaka ve lazer kazıma için <strong>.SVG</strong> önerilir.
      </p>
    </div>
  );
}