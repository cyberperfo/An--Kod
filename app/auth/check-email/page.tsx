"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resendVerification, type AuthActionState } from "../actions";

const initialState: AuthActionState = { error: null, message: null };

export default function CheckEmailPage() {
  const [state, formAction, isPending] = useActionState(
    resendVerification,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-2xl text-stone-800">E-postanı kontrol et</h1>
        <p className="mt-3 text-sm text-stone-500">
          Sana bir doğrulama linki gönderdik. Hesabını aktifleştirmek için gelen kutunu
          kontrol et ve linke tıkla.
        </p>

        {(state.error || state.message) && (
          <p
            role="status"
            className={`mt-5 rounded-lg border p-3 text-sm ${
              state.error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {state.error || state.message}
          </p>
        )}

        <form action={formAction} className="mt-6 space-y-3 text-left">
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            E-posta adresiniz
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            placeholder="ornek@alanadi.com"
            className="block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Gönderiliyor..." : "Doğrulama e-postasını yeniden gönder"}
          </button>
        </form>

        <Link href="/auth/login" className="mt-5 inline-block text-sm text-stone-600 underline underline-offset-4">
          Giriş sayfasına dön
        </Link>
      </div>
    </div>
  );
}
