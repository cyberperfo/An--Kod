export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/DashboardNavbar";

const VALUES = [
  {
    title: "Saygı",
    description: "Her anı sayfası, sevdiklerini kaybetmiş bir aileye ait — verisini ve gizliliğini en üst düzeyde koruruz.",
  },
  {
    title: "Sadelik",
    description: "Zor bir dönemde karmaşık arayüzlerle uğraşmak istemezsiniz; her akışı olabildiğince az adıma indirdik.",
  },
  {
    title: "Kalıcılık",
    description: "Dijital anı sayfaları ve fiziksel QR plaketler, yıllar sonra da erişilebilir olacak şekilde tasarlandı.",
  },
];

export default async function AboutPage() {
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

      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">Hakkımızda</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Anıları dijital ve fiziksel dünyada bir araya getiriyoruz.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Misyonumuz</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            ANIKOD, kaybedilen bir yakının hatırasını dijital bir sayfada yaşatmayı ve bu sayfayı
            fiziksel bir QR plaket aracılığıyla mezar taşına veya anma alanına taşımayı amaçlar.
            Böylece bir anıya kameranızla dokunmak, o kişinin fotoğraflarını, hikayesini ve
            sevdiklerinin bıraktığı taziye mesajlarını görmek kadar kolay hale gelir.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">{value.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">İletişim</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            Sorularınız için{" "}
            <a href="/dashboard/destek" className="font-medium text-stone-900 underline underline-offset-4 dark:text-white">
              Destek Merkezi
            </a>{" "}
            üzerinden bize ulaşabilirsiniz.
          </p>
        </div>
      </main>
    </div>
  );
}
