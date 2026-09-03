import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Şimdilik örnek boş anı listesi (Backend bağlandığında buradan veri çekecek)
  const memories: any[] = [];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Üst Bar (Navbar) */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              ANIKOD
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                Kontrol Paneli
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-stone-500 sm:inline-block">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Başlık ve Aksiyon */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">
              Anı Sayfalarım
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Oluşturduğunuz anı sayfalarını yönetin, düzenleyin ve QR kodlarını görüntüleyin.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Yeni Anı Oluştur
          </Link>
        </div>

        {/* İstatistik / Bilgi Şeridi */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-stone-500">Toplam Anı Sayfası</p>
            <p className="mt-2 font-serif text-2xl font-bold text-stone-900">{memories.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-stone-500">Toplam Ziyaret</p>
            <p className="mt-2 font-serif text-2xl font-bold text-stone-900">0</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-stone-500">Bırakılan Notlar</p>
            <p className="mt-2 font-serif text-2xl font-bold text-stone-900">0</p>
          </div>
        </div>

        {/* Liste veya Boş Durum (Empty State) */}
        <div className="mt-8">
          {memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <div className="rounded-full bg-stone-100 p-4 text-stone-600">
                <svg
                  className="h-8 w-8 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-stone-900">
                Henüz bir anı sayfası oluşturmadınız
              </h3>
              <p className="mt-1 max-w-sm text-sm text-stone-500">
                İlk anı sayfanızı hemen oluşturun, sevdiklerinizin hatıralarını dijitalde ölümsüzleştirin.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
              >
                İlk Sayfayı Başlat
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}