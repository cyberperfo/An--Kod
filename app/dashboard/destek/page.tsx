export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/DashboardNavbar";
import SupportContactForm from "@/components/SupportContactForm";

const QUICK_HELP = [
  {
    title: "Sipariş durumu",
    description: "Sipariş durumunuzu ve kargo takibinizi Panel > Siparişler bölümünden görebilirsiniz.",
  },
  {
    title: "Anı sayfası gizliliği",
    description: "Anı sayfanızın kimler tarafından görülebileceğini düzenleme sayfasından değiştirebilirsiniz.",
  },
  {
    title: "Aile üyesi davet etme",
    description: "Her anı sayfasındaki \"Aile Üyeleri\" bağlantısından e-posta ile davet gönderebilirsiniz.",
  },
];

export default async function SupportPage() {
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
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">Destek Merkezi</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Size nasıl yardımcı olabiliriz?
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {QUICK_HELP.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
            >
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="mb-1 font-serif text-lg font-bold text-stone-900 dark:text-white">
            Bize Ulaşın
          </h2>
          <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
            Aşağıdaki bölümlerin cevaplayamadığı bir sorunuz mu var? Formu doldurun, size dönelim.
          </p>
          <SupportContactForm defaultName={user.user_metadata?.full_name || ""} defaultEmail={user.email || ""} />
        </div>
      </main>
    </div>
  );
}
