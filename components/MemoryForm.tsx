"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMemory } from "../app/m/[slug]/actions";

interface MemoryFormProps {
  memorialId: string;
  slug: string;
}

export default function MemoryForm({ memorialId, slug }: MemoryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // useActionState ile hem yüklenme durumunu hem de aksiyonu yönetiyoruz
  const [, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      await addMemory(formData);
      formRef.current?.reset(); // Gönderim başarılı olunca formu temizle
      return null;
    },
    null
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-3"
    >
      <input type="hidden" name="memorialId" value={memorialId} />
      <input type="hidden" name="slug" value={slug} />

      <h4 className="text-sm font-semibold text-stone-800">
        Bir Anı veya Taziye Mesajı Bırakın
      </h4>

      <input
        type="text"
        name="authorName"
        required
        disabled={isPending}
        placeholder="Adınız Soyadınız"
        className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:outline-none disabled:bg-stone-100 disabled:opacity-70 transition"
      />
      <textarea
        name="message"
        required
        rows={3}
        disabled={isPending}
        placeholder="Paylaşmak istediğiniz duygularınız veya hatıranız..."
        className="w-full resize-none rounded-xl border border-stone-200 p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:outline-none disabled:bg-stone-100 disabled:opacity-70 transition"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed cursor-pointer min-w-[110px]"
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              İletiliyor...
            </span>
          ) : (
            "Mesajı İlet"
          )}
        </button>
      </div>
    </form>
  );
}