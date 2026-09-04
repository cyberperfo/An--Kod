"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { updateMemorial, type UpdateMemorialState } from "@/app/dashboard/memorials/[id]/actions";
import type { Database } from "@/types/database.types";

type Memorial = Database["public"]["Tables"]["memorials"]["Row"];

const initialState: UpdateMemorialState = { error: null };

export default function EditMemorialForm({ memorial }: { memorial: Memorial }) {
  const [state, formAction, isPending] = useActionState(updateMemorial, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(memorial.cover_photo_url);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setFile = (file: File | null) => {
    if (!file) return;
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
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <input type="hidden" name="id" value={memorial.id} />
      <input type="hidden" name="existingPhotoUrl" value={memorial.cover_photo_url ?? ""} />

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
            isDragging ? "border-stone-500 bg-stone-100" : "border-stone-200 bg-stone-50 hover:bg-stone-100"
          }`}
        >
          {previewUrl ? (
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Portre" className="h-full w-full object-cover" />
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
          <p className="text-sm font-medium text-stone-700">
            Değiştirmek için sürükleyin veya <span className="underline">tıklayın</span>
          </p>
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

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
          Ad Soyad
        </label>
        <input
          required
          name="fullName"
          type="text"
          defaultValue={memorial.full_name ?? ""}
          disabled={isPending}
          className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
            Doğum Tarihi
          </label>
          <input
            name="birthDate"
            type="date"
            defaultValue={memorial.birth_date ?? ""}
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
            defaultValue={memorial.death_date ?? ""}
            disabled={isPending}
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
          Biyografi ve Anılar
        </label>
        <textarea
          name="bio"
          rows={4}
          defaultValue={memorial.biography ?? ""}
          disabled={isPending}
          className="w-full resize-none rounded-xl border border-stone-200 p-3.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

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
              Kaydediliyor...
            </>
          ) : (
            "Değişiklikleri Kaydet"
          )}
        </button>
      </div>
    </form>
  );
}
