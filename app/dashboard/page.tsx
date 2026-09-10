export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/media";
import DashboardNavbar from "@/components/DashboardNavbar";
import MemorialCard from "@/components/MemorialCard";
import PendingInviteAcceptButton from "@/components/PendingInviteAcceptButton";
import { MEMORIAL_PAGE_PRICE_TRY, PLAQUE_ORDER_PRICE_TRY } from "@/lib/pricing";

const ORDER_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: "Ödeme Bekleniyor", className: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300" },
  paid: { label: "Sıraya Alındı", className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  in_production: { label: "Üretimde", className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  shipped: { label: "Kargoda", className: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
  completed: { label: "Teslim Edildi", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  cancelled: { label: "İptal Edildi", className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data } = await (supabase.from("memorials") as any)
    .select(
      `
      *,
      orders (
        id,
        status,
        tracking_number,
        carrier,
        plaque_type,
        plate_type,
        created_at
      )
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const memorials = (data as any[]) || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const signedPhotoUrls = await getSignedPhotoUrls(
    supabase,
    memorials.map((m) => m.cover_photo_path)
  );

  const { data: pendingInvites } = await (supabase.from("memorial_members") as any)
    .select("id, memorial_id, role, memorials ( full_name, slug )")
    .eq("invited_email", user.email)
    .eq("status", "invited");

  // Siparişler bölümü için tüm anılardaki siparişleri tek listede düzleştir.
  const allOrders = memorials
    .flatMap((memorial) =>
      (memorial.orders || []).map((order: any) => ({ ...order, memorial }))
    )
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const firstMemorialSlug = memorials[0]?.slug ?? null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
      <DashboardNavbar userEmail={user.email ?? null} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {pendingInvites && pendingInvites.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <h2 className="font-serif text-sm font-bold text-amber-900 dark:text-amber-300">
              Bekleyen Aile Üyeliği Davetiniz Var
            </h2>
            <ul className="mt-3 space-y-2">
              {(pendingInvites as any[]).map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm shadow-sm dark:bg-stone-900"
                >
                  <span className="text-stone-700 dark:text-stone-300">
                    <strong>{invite.memorials?.full_name}</strong> anı sayfasına davet edildiniz.
                  </span>
                  <PendingInviteAcceptButton inviteId={invite.id} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Karşılama */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">
            Merhaba{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Anı sayfalarınızı, siparişlerinizi ve paketlerinizi buradan yönetin.
          </p>
        </div>

        {/* Ana Kategori Kartları */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard/paketler"
            className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v6.858a1.125 1.125 0 01-1.125 1.125H3.375A1.125 1.125 0 012.25 17.466V10.61c0-.97.616-1.813 1.5-2.097m16.5 0V6.75A2.25 2.25 0 0018 4.5H6a2.25 2.25 0 00-2.25 2.25v1.761m16.5 0v.513a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-.513" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Paketler</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Anı sayfası ve QR plaket fiyatlarını görün.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
              Fiyatları gör
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          <a
            href="#siparisler"
            className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Siparişler</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {allOrders.length > 0
                  ? `${allOrders.length} plaket siparişiniz var.`
                  : "Henüz sipariş vermediniz."}
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
              Siparişleri gör
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

          <a
            href="#anilar"
            className="group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="mt-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Anılar</h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {memorials.length > 0
                  ? `${memorials.length} anı sayfanız var.`
                  : "Henüz bir anı sayfası oluşturmadınız."}
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-rose-600 dark:text-rose-400">
              Anıları gör
              <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>
        </div>

        {/* Hızlı İşlemler */}
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Hızlı İşlemler
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickAction
              href="/dashboard/new"
              label="Yeni Anı Sayfası"
              sub={`₺${MEMORIAL_PAGE_PRICE_TRY.toLocaleString("tr-TR")}`}
              colorClass="bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              }
            />
            <QuickAction
              href={firstMemorialSlug ? "#anilar" : "/dashboard/new"}
              label="QR Plaket Sipariş Ver"
              sub={`₺${PLAQUE_ORDER_PRICE_TRY}`}
              colorClass="bg-emerald-600 text-white"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h4.5v4.5h-4.5v-4.5zM15.75 4.5h4.5v4.5h-4.5v-4.5zM3.75 15.75h4.5v4.5h-4.5v-4.5zM15.75 15.75h4.5v4.5h-4.5v-4.5z" />
              }
            />
            <QuickAction
              href="/dashboard/destek"
              label="Destek"
              sub="Yardım merkezi"
              colorClass="bg-blue-600 text-white"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              }
            />
            <QuickAction
              href="/dashboard/nasil-calisir"
              label="Nasıl Çalışır?"
              sub="Rehber"
              colorClass="bg-amber-500 text-white"
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5a.75.75 0 01.75-.75zM12 9.75v6M12 21.75c-5.385 0-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z" />
              }
            />
          </div>
        </div>

        {/* Siparişler */}
        <section id="siparisler" className="mt-12 scroll-mt-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Siparişleriniz</h2>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {allOrders.length} sipariş
            </span>
          </div>

          {allOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
              Henüz bir plaket siparişiniz yok. Bir anı sayfasından sipariş verebilirsiniz.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-100 bg-stone-50 text-xs font-semibold uppercase text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
                    <tr>
                      <th className="px-5 py-3">Anı Sayfası</th>
                      <th className="px-5 py-3">Durum</th>
                      <th className="px-5 py-3">Kargo</th>
                      <th className="px-5 py-3">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {allOrders.map((order) => {
                      const status = ORDER_STATUS_LABEL[order.status] ?? ORDER_STATUS_LABEL.pending;
                      return (
                        <tr key={order.id}>
                          <td className="px-5 py-3.5 font-medium text-stone-800 dark:text-stone-200">
                            {order.memorial?.full_name || "Silinmiş Anı"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">
                            {order.tracking_number
                              ? `${order.carrier || "Kargo"} · ${order.tracking_number}`
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">
                            {new Date(order.created_at).toLocaleDateString("tr-TR")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Anılar */}
        <section id="anilar" className="mt-12 scroll-mt-24">
          <div className="mb-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Anı Sayfalarınız</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Sevdikleriniz için oluşturduğunuz dijital hatıra sayfalarını buradan yönetin.
            </p>
          </div>

          {memorials.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white p-12 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-stone-800">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-200">
                Henüz oluşturulmuş bir anı sayfası yok
              </h3>
              <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
                İlk hatıra sayfasını oluşturup QR kodunu ve bağlantısını almak için hemen başlayın.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              >
                + İlk Anı Sayfasını Oluştur
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {memorials.map((memorial) => (
                <MemorialCard
                  key={memorial.id}
                  memorial={memorial}
                  siteUrl={siteUrl}
                  photoUrl={
                    memorial.cover_photo_path ? signedPhotoUrls[memorial.cover_photo_path] ?? null : null
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function QuickAction({
  href,
  label,
  sub,
  colorClass,
  icon,
}: {
  href: string;
  label: string;
  sub: string;
  colorClass: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-stone-100 p-4 transition-all hover:-translate-y-0.5 hover:border-stone-200 hover:shadow-md dark:border-stone-800 dark:hover:border-stone-700"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ${colorClass}`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">{label}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500">{sub}</p>
      </div>
    </Link>
  );
}
