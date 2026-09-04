"use client";

import { useState } from "react";
import Link from "next/link";
import { createMemory } from "./actions";

export default function NewMemoryPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased p-6 sm:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            ← Dashboard'a Dön
          </Link>
          <h1 className="text-3xl font-bold font-serif text-stone-900 mt-2">
            Yeni Anı Sayfası Oluştur
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kayıp yakınınızın hatıralarını, fotoğraflarını ve biyografisini burada toplayın.
          </p>
        </div>

        {/* Form Alanı */}
        <form
          action={createMemory}
          encType="multipart/form-data"
          className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Fotoğraf Yükleme */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Ana Portre Fotoğrafı
            </label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-stone-400 overflow-hidden shrink-0">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Seçilen fotoğraf"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Ad Soyad & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Ad Soyad
              </label>
              <input
                required
                name="fullName"
                type="text"
                placeholder="Örn: Mehmet Özkan"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Sayfa Bağlantısı (Slug)
              </label>
              <div className="flex rounded-xl border border-stone-200 overflow-hidden focus-within:border-stone-400">
                <span className="bg-stone-50 px-3 py-2.5 text-xs text-stone-400 border-r border-stone-200 flex items-center shrink-0">
                  anikod.com/m/
                </span>
                <input
                  name="slug"
                  type="text"
                  placeholder="mehmet-ozkan"
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Doğum Tarihi
              </label>
              <input
                name="birthDate"
                type="date"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Vefat Tarihi
              </label>
              <input
                name="deathDate"
                type="date"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Biyografi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              Biyografi ve Anılar
            </label>
            <textarea
              name="bio"
              rows={4}
              placeholder="Hayatı, anıları, değerleri ve bıraktığı izler hakkında bir şeyler yazın..."
              className="w-full rounded-xl border border-stone-200 p-3.5 text-sm focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>

          {/* Butonlar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
            >
              Anı Sayfasını Yayınla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}