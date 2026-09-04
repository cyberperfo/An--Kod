import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import MemorialCard from "@/components/MemorialCard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: memorials } = await supabase
    .from("memorials")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      {/* Üst Menü / Navbar */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
              ANIKOD
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              Yönetim Paneli
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-stone-500 sm:inline">{user.email}</span>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Yeni Anı Sayfası
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="cursor-pointer rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900">Anı Sayfalarınız</h1>
          <p className="mt-1 text-sm text-stone-500">
            Sevdikleriniz için oluşturduğunuz dijital hatıra sayfalarını buradan yönetin.
          </p>
        </div>

        {!memorials || memorials.length === 0 ? (
          /* Boş Ekran Durumu */
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h2 className="font-serif text-lg font-semibold text-stone-800">
              Henüz oluşturulmuş bir anı sayfası yok
            </h2>
            <p className="mt-1 max-w-sm text-sm text-stone-500">
              İlk hatıra sayfasını oluşturup QR kodunu ve bağlantısını almak için hemen başlayın.
            </p>
            <Link
              href="/dashboard/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
            >
              + İlk Anı Sayfasını Oluştur
            </Link>
          </div>
        ) : (
          /* Anı Sayfalarının Listesi */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {memorials.map((memorial) => (
              <MemorialCard key={memorial.id} memorial={memorial} siteUrl={siteUrl} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
