"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  verifySignupOtp,
  resendSignupOtp,
  type VerifyOtpState,
  type ResendOtpState,
} from "@/app/auth/actions";

const verifyInitialState: VerifyOtpState = { error: null };
const resendInitialState: ResendOtpState = { error: null, sent: false };

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [verifyState, verifyAction, isVerifying] = useActionState(
    verifySignupOtp,
    verifyInitialState
  );
  const [resendState, resendAction, isResending] = useActionState(
    resendSignupOtp,
    resendInitialState
  );
  const [code, setCode] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100/60 px-4 py-12 selection:bg-stone-800 selection:text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900">
              ANIKOD
            </h1>
          </Link>
          <p className="mt-2 text-sm text-stone-600">
            {email ? (
              <>
                <strong className="font-semibold text-stone-800">{email}</strong> adresine
                gönderdiğimiz 6 haneli kodu girin.
              </>
            ) : (
              "E-postanıza gönderdiğimiz 6 haneli kodu girin."
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <form action={verifyAction} className="space-y-5">
            <input type="hidden" name="email" value={email} />

            {verifyState.error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700"
              >
                <span className="leading-snug">{verifyState.error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="token"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600"
              >
                Doğrulama Kodu
              </label>
              <input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                pattern="\d{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={isVerifying}
                placeholder="000000"
                className="block w-full rounded-lg border border-stone-300 bg-stone-50/50 px-3.5 py-3 text-center text-2xl tracking-[0.5em] text-stone-900 transition-colors placeholder:text-stone-300 focus:border-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="inline-flex w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? "Doğrulanıyor..." : "Hesabı Doğrula"}
            </button>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-5 text-center text-xs text-stone-500">
            {resendState.sent ? (
              <p className="font-medium text-emerald-700">
                Yeni kod gönderildi, gelen kutunuzu kontrol edin.
              </p>
            ) : (
              <>
                Kod gelmedi mi?{" "}
                <form action={resendAction} className="inline">
                  <input type="hidden" name="email" value={email} />
                  <button
                    type="submit"
                    disabled={isResending || !email}
                    className="font-medium text-stone-900 underline underline-offset-4 transition-colors hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResending ? "Gönderiliyor..." : "Tekrar gönder"}
                  </button>
                </form>
                {resendState.error && (
                  <p className="mt-2 text-red-600">{resendState.error}</p>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-600">
          <Link
            href="/auth/login"
            className="font-medium text-stone-900 underline underline-offset-4 transition-colors hover:text-stone-700"
          >
            Giriş ekranına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
