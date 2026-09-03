import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900">
        ANIKOD
      </h1>
      <p className="mt-3 max-w-sm text-sm text-stone-600">
        Sevdiklerinizin hatıralarını dijitalde yaşatın.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Panele Git
        </Link>
        <Link
          href="/auth/login"
          className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
        >
          Giriş Yap
        </Link>
      </div>
    </div>
  );
}