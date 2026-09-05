"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-800"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.72 13.829c-.24-1.076-.641-2.074-1.17-2.977M18 10a6 6 0 00-12 0v4.25m12 0V10a6 6 0 00-6-6m-6 6v4.25M3 15.75A2.25 2.25 0 005.25 18h13.5A2.25 2.25 0 0021 15.75v-1.5A2.25 2.25 0 0018.75 12H5.25A2.25 2.25 0 003 14.25v1.5z"
        />
      </svg>
      Yazdır / Lazer Şablonu Al
    </button>
  );
}