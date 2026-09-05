"use client";

import { useRef, useTransition, useState } from "react";
import { addMemory } from "@/app/m/[slug]/actions";

interface GuestbookFormProps {
  memorialId: string;
  slug: string;
}

export default function GuestbookForm({ memorialId, slug }: GuestbookFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (formData: FormData) => {
    setStatus(null);
    startTransition(async () => {
      const res = await addMemory(formData);
      if (res?.success) {
        setStatus({
          type: "success",
          text: "Mesajınız ve duanız hatıra sayfasına iletildi.",
        });
        formRef.current?.reset();
        setTimeout(() => setStatus(null), 5000);
      } else {
        setStatus({
          type: "error",
          text: res?.error || "Mesaj iletilirken bir hata oluştu.",
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="font-serif text-lg font-bold text-stone-900">
        Bir Hatıra veya Taziye Bırakın
      </h3>
      <p className="mt-1 text-xs text-stone-500">
        Merhumu yâd etmek, ailenin acısını paylaşmak için duygu ve anılarınızı yazabilirsiniz.
      </p>

      {status && (
        <div
          className={`mt-4 rounded-xl p-3 text-xs font-medium ${
            status.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {status.text}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="mt-4 space-y-3">
        <input type="hidden" name="memorialId" value={memorialId} />
        <input type="hidden" name="slug" value={slug} />

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Adınız Soyadınız *
          </label>
          <input
            type="text"
            name="authorName"
            required
            placeholder="Örn: Ahmet Yılmaz"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700">
            Mesajınız / Duanız *
          </label>
          <textarea
            name="message"
            required
            rows={3}
            placeholder="Güzel bir hatıra veya taziye iletinizi paylaşın..."
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? "İletiliyor..." : "Mesajı Paylaş"}
        </button>
      </form>
    </div>
  );
}