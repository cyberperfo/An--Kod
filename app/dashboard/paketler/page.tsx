export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/DashboardNavbar";
import { MEMORIAL_PAGE_PRICE_TRY, PLAQUE_ORDER_PRICE_TRY } from "@/lib/pricing";

const PACKAGES = [
  {
    title: "Anı Sayfası",
    price: MEMORIAL_PAGE_PRICE_TRY,
    description: "Sevdikleriniz için ömür boyu erişilebilir, QR kodlu dijital hatıra sayfası.",
    features: [
      "Sınırsız fotoğraf ve biyografi",
      "Ziyaretçi defteri / taziye mesajları",
      "Gizlilik seviyesi kontrolü (herkese açık / sadece aile / gizli)",
      "Aile üyesi davet etme",
    ],
    cta: { href: "/dashboard/new", label: "Anı Sayfası Oluştur" },
    accent: "border-stone-900 dark:border-white",
  },
  {
    title: "QR Plaket",
    price: PLAQUE_ORDER_PRICE_TRY,
    description: "Anı sayfanıza bağlı, fiziksel olarak teslim edilen lazer kazıma QR plaket.",
    features: [
      "Paslanmaz çelik, mermer, mat siyah veya altın kaplama seçenekleri",
      "Kargo takibi",
      "Anı sayfanızla otomatik eşleşen QR kod",
    ],
    cta: { href: "/dashboard#anilar", label: "Plaket Sipariş Ver" },
    accent: "border-emerald-600",
  },
];

export default async function PackagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
      <DashboardNavbar userEmail={user.email ?? null} />

      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">Paketler</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Basit, tek seferlik fiyatlandırma — gizli ücret yok.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.title}
              className={`flex flex-col rounded-3xl border-2 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:bg-stone-900 ${pkg.accent}`}
            >
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">{pkg.title}</h2>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
                  ₺{pkg.price.toLocaleString("tr-TR")}
                </span>
                <span className="text-sm text-stone-400">/ tek seferlik</span>
              </p>
              <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">{pkg.description}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={pkg.cta.href}
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
              >
                {pkg.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
