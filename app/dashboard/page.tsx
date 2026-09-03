import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Aktif kullanıcıyı al
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Kullanıcıya ait anı sayfalarını çek
  const { data: memorials, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased">
      {/* Üst Menü / Navbar */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
              ANIKOD
            </span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
              Yönetim Paneli
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-500 hidden sm:inline">
              {user.email}
            </span>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Yeni Anı Sayfası
            </Link>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Anı Sayfalarınız
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Sevdikleriniz için oluşturduğunuz dijital hatıra sayfalarını buradan yönetin.
          </p>
        </div>

        {/* Kayıt Yoksa Gösterilecek Boş Durum (Empty State) */}
        {(!memorials || memorials.length === 0) ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
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
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 shadow-sm"
            >
              + İlk Anı Sayfasını Oluştur
            </Link>
          </div>
        ) : (
          /* Anı Sayfalarının Listesi */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memorials.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-xs font-mono text-stone-600">
                      /m/{item.slug}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {item.full_name}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    {item.birth_date || "—"} &nbsp;•&nbsp; {item.death_date || "—"}
                  </p>
                  {item.biography && (
                    <p className="mt-3 text-sm text-stone-600 line-clamp-3">
                      {item.biography}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <Link
                    href={`/m/${item.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-stone-900 hover:underline inline-flex items-center gap-1"
                  >
                    Sayfayı Gör
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>

                  <Link
                    href={`/dashboard/memorials/${item.id}`}
                    className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    Yönet
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}