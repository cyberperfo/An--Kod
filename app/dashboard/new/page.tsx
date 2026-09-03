"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewMemoryPage() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Üst Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Geri Dön
            </Link>
            <span className="text-xs font-medium text-stone-400">/</span>
            <span className="text-xs font-medium text-stone-600">Yeni Anı Sayfası</span>
          </div>
          <span className="font-serif text-lg font-bold text-stone-900">ANIKOD</span>
        </div>
      </header>

      {/* Form Alanı */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
            Yeni Anı Sayfası Oluştur
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Kayıp yakınınızın hatıralarını, fotoğraflarını ve biyografisini burada toplayın.
          </p>
        </div>

        <form className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Fotoğraf Yükleme Alanı */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Ana Portre Fotoğrafı
            </label>
            <div className="mt-2 flex items-center gap-5">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-400">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Önizleme" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-8 w-8 text-stone-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="portraitImage"
                  name="portraitImage"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-stone-700 hover:file:bg-stone-200"
                />
                <p className="mt-1 text-xs text-stone-400">JPG, PNG veya WebP. Maksimum 5 MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Ad Soyad */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Ad Soyad
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Örn: Mehmet Özkan"
                className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            {/* Özel Bağlantı (Slug) */}
            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Sayfa Bağlantısı (Slug)
              </label>
              <div className="flex rounded-lg border border-stone-300 bg-stone-50/50 text-sm text-stone-500">
                <span className="flex items-center pl-3 pr-1 text-xs text-stone-400">anikod.com/m/</span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  placeholder="mehmet-ozkan"
                  className="block w-full rounded-r-lg bg-transparent px-2.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Doğum ve Vefat Tarihleri */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="birthDate" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Doğum Tarihi
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="deathDate" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Vefat Tarihi
              </label>
              <input
                id="deathDate"
                name="deathDate"
                type="date"
                className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Biyografi ve Anı Metni */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Biyografi ve Anılar
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={5}
              placeholder="Hayatı, anıları, değerleri ve bıraktığı izler hakkında bir şeyler yazın..."
              className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Ayarlar (Ziyaretçi Defteri İzni) */}
          <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
            <input
              id="allowGuestbook"
              name="allowGuestbook"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <label htmlFor="allowGuestbook" className="text-xs text-stone-700">
              <span className="font-semibold">Ziyaretçi Defterini Aç:</span> Ziyaretçiler anı sayfasına taziye ve anı mesajı bırakabilsin.
            </label>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
            >
              İptal
            </Link>
            <button
              type="button"
              className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
            >
              Anı Sayfasını Yayınla
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}