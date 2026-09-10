export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/DashboardNavbar";
import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";
import { MEMORIAL_PAGE_PRICE_TRY, PLAQUE_ORDER_PRICE_TRY } from "@/lib/pricing";

const STEPS = [
  {
    title: "Anı sayfanızı oluşturun",
    description:
      "Sevdiğinizin adı, fotoğrafı ve biyografisiyle birkaç dakikada dijital bir hatıra sayfası oluşturun.",
  },
  {
    title: "Gizlilik seviyesini seçin",
    description:
      "Sayfayı herkese açık, sadece aileye özel veya tamamen gizli yapabilir; istediğiniz zaman değiştirebilirsiniz.",
  },
  {
    title: "QR plaket sipariş verin",
    description: `${PLAQUE_ORDER_PRICE_TRY}₺ karşılığında, anı sayfanıza bağlı fiziksel bir plaket sipariş edin.`,
  },
  {
    title: "Plaketi mezar taşına veya anma alanına yerleştirin",
    description:
      "Plaket üretilip kargoya verildikten sonra, üzerindeki QR kodu okutan herkes anı sayfasına ulaşır.",
  },
];

const FAQ: FaqItem[] = [
  {
    question: "Anı sayfası oluşturmak ne kadar sürer?",
    answer: "Ortalama 3-5 dakika içinde ad, fotoğraf ve biyografi bilgileriyle sayfanızı yayınlayabilirsiniz.",
  },
  {
    question: `Anı sayfası fiyatı nedir?`,
    answer: `Anı sayfası oluşturmak ₺${MEMORIAL_PAGE_PRICE_TRY.toLocaleString("tr-TR")}, fiziksel QR plaket siparişi ise ₺${PLAQUE_ORDER_PRICE_TRY}'dir. Gizli ücret yoktur.`,
  },
  {
    question: "Anı sayfamı sonradan düzenleyebilir miyim?",
    answer: "Evet — fotoğraf, biyografi, tarihler ve gizlilik seviyesi dahil her şeyi panelden istediğiniz zaman düzenleyebilirsiniz.",
  },
  {
    question: "Kimler anı sayfamı görebilir?",
    answer: "Bunu siz belirlersiniz: herkese açık, sadece davet ettiğiniz aile üyeleri, ya da sadece siz.",
  },
  {
    question: "Plaket siparişimin durumunu nasıl takip ederim?",
    answer: "Panel > Siparişler bölümünden anlık durumu (üretimde, kargoda, teslim edildi) ve kargo takip numaranızı görebilirsiniz.",
  },
  {
    question: "Aile üyelerimi nasıl davet ederim?",
    answer: "İlgili anı sayfasındaki \"Aile Üyeleri\" bağlantısından e-posta ile davet gönderebilirsiniz; davet edilen kişi giriş yaptığında daveti kabul edebilir.",
  },
];

export default async function HowItWorksPage() {
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
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">Nasıl Çalışır?</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            ANIKOD ile bir hatırayı ölümsüzleştirmek dört basit adımdan oluşur.
          </p>
        </div>

        <ol className="mb-14 space-y-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white dark:bg-white dark:text-stone-900">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div>
          <h2 className="mb-4 font-serif text-xl font-bold text-stone-900 dark:text-white">
            Sıkça Sorulan Sorular
          </h2>
          <FaqAccordion items={FAQ} />
        </div>
      </main>
    </div>
  );
}
