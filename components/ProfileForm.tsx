"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/dashboard/profil/actions";

const initialState: ProfileFormState = { error: null, success: false };

export default function ProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState);

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
      {state.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          Profiliniz güncellendi.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Ad Soyad
        </label>
        <input
          name="fullName"
          required
          defaultValue={fullName}
          disabled={isPending}
          className="w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
          Telefon
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="05XX XXX XX XX"
          defaultValue={phone}
          disabled={isPending}
          className="w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:focus:border-white"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </button>
    </form>
  );
}
