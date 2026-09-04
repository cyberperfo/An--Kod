"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import ShareQRModal from "./ShareQRModal";
import Toast from "./Toast";
import { deleteMemorial } from "@/app/dashboard/actions";
import type { Database } from "@/types/database.types";

type Memorial = Database["public"]["Tables"]["memorials"]["Row"];

interface MemorialCardProps {
  memorial: Memorial;
  siteUrl: string;
}

export default function MemorialCard({ memorial, siteUrl }: MemorialCardProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const publicUrl = `${siteUrl}/m/${memorial.slug}`;

  const handleDelete = () => {
    const confirmed = window.confirm(
      `"${memorial.full_name}" hatıra sayfasını silmek üzeresiniz. Bu işlem geri alınamaz, emin misiniz?`
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", memorial.id);

    startTransition(async () => {
      await deleteMemorial(formData);
      setToast("Anı sayfası silindi.");
    });
  };

  return (
    <>
      <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600">
              /m/{memorial.slug}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
              {memorial.cover_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={memorial.cover_photo_url}
                  alt={memorial.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">{memorial.full_name}</h3>
              <p className="mt-0.5 text-xs text-stone-500">
                {memorial.birth_date || "—"} &nbsp;•&nbsp; {memorial.death_date || "—"}
              </p>
            </div>
          </div>

          {memorial.biography && (
            <p className="mt-4 line-clamp-3 text-sm text-stone-600">{memorial.biography}</p>
          )}
        </div>

        <div className="mt-6 space-y-3 border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/m/${memorial.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 hover:underline"
            >
              Sayfayı Gör
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 4.5h4.5v4.5h-4.5v-4.5zM15.75 4.5h4.5v4.5h-4.5v-4.5zM3.75 15.75h4.5v4.5h-4.5v-4.5zM15.75 15.75h4.5v4.5h-4.5v-4.5z"
                />
              </svg>
              QR Kod
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/memorials/${memorial.id}/edit`}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100"
            >
              Düzenle
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {isPending ? "Siliniyor..." : "Sil"}
            </button>
          </div>
        </div>
      </div>

      {qrOpen && (
        <ShareQRModal url={publicUrl} name={memorial.full_name} onClose={() => setQrOpen(false)} />
      )}

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}
