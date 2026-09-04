"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { createMemory, type CreateMemoryState } from "./actions";

const initialState: CreateMemoryState = { error: null };

export default function NewMemoryPage() {
  const [state, formAction, isPending] = useActionState(createMemory, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setFile = (file: File | null) => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    // Sürüklenen dosyayı gizli <input type="file">'a elle bağlıyoruz —
    // native drag&drop, input'un kendi change event'ini tetiklemez.
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 text-stone-900 antialiased sm:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            ← Dashboard&apos;a Dön
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">
            Yeni Anı Sayfası Oluştur
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Kayıp yakınınızın hatıralarını, fotoğraflarını ve biyografisini burada toplayın.
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Sürükle-bırak fotoğraf alanı */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
              Ana Portre Fotoğrafı
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? "border-stone-500 bg-stone-100"
                  : "border-stone-200 bg-stone-50 hover:bg-stone-100"
              }`}
            >
              {previewUrl ? (
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Seçilen fotoğraf" className="h-full w-full object-cover" />
                </div>
              ) : (
                <svg
                  className="h-9 w-9 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-9-3l3-3m0 0l3 3m-3-3v11.25"
                  />
                </svg>
              )}
              <div>
                <p className="text-sm font-medium text-stone-700">
                  Fotoğrafı buraya sürükleyin veya <span className="underline">seçmek için tıklayın</span>
                </p>
                <p className="mt-0.5 text-xs text-stone-400">PNG, JPG — maks. 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                name="photo"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>
          </div>

          {/* Ad Soyad & Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Ad Soyad
              </label>
              <input
                required
                name="fullName"
                type="text"
                placeholder="Örn: Mehmet Özkan"
                disabled={isPending}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Sayfa Bağlantısı (Slug)
              </label>
              <div className="flex overflow-hidden rounded-xl border border-stone-200 focus-within:border-stone-400">
                <span className="flex shrink-0 items-center border-r border-stone-200 bg-stone-50 px-3 py-2.5 text-xs text-stone-400">
                  anikod.com/m/
                </span>
                <input
                  name="slug"
                  type="text"
                  placeholder="otomatik oluşturulur"
                  disabled={isPending}
                  className="w-full px-3 py-2 text-sm focus:outline-none disabled:bg-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Doğum Tarihi
              </label>
              <input
                name="birthDate"
                type="date"
                disabled={isPending}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Vefat Tarihi
              </label>
              <input
                name="deathDate"
                type="date"
                disabled={isPending}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
              />
            </div>
          </div>

          {/* Biyografi */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
              Biyografi ve Anılar
            </label>
            <textarea
              name="bio"
              rows={4}
              disabled={isPending}
              placeholder="Hayatı, anıları, değerleri ve bıraktığı izler hakkında bir şeyler yazın..."
              className="w-full resize-none rounded-xl border border-stone-200 p-3.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
            />
          </div>

          {state.error && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <Link
              href="/dashboard"
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isPending ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Yayınlanıyor...
                </>
              ) : (
                "Anı Sayfasını Yayınla"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
