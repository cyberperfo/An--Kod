"use client";

import { useActionState } from "react";
import { submitSupportMessage, type SupportFormState } from "@/app/dashboard/destek/actions";

const initialState: SupportFormState = { error: null, success: false };

export default function SupportContactForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const [state, formAction, isPending] = useActionState(submitSupportMessage, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
          Mesajınız iletildi, teşekkürler!
        </p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          Ekibimiz en kısa sürede size dönüş yapacak.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Ad Soyad
          </label>
          <input
            name="fullName"
            required
            defaultValue={defaultName}
            disabled={isPending}
            className="w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            E-posta
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
            disabled={isPending}
            className="w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Konu
        </label>
        <input
          name="subject"
          required
          placeholder="Örn: Kargo takip numaram gelmedi"
          disabled={isPending}
          className="w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Mesajınız
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Sorununuzu veya sorunuzu detaylı bir şekilde yazın..."
          disabled={isPending}
          className="w-full resize-none rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {isPending ? "Gönderiliyor..." : "Mesajı Gönder"}
      </button>
    </form>
  );
}
