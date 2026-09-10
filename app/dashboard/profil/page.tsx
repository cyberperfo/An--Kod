export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/DashboardNavbar";
import ProfileForm from "@/components/ProfileForm";
import EmailChangeForm from "@/components/EmailChangeForm";
import PasswordChangeForm from "@/components/PasswordChangeForm";

const ROLE_LABEL: Record<string, string> = {
  customer: "Müşteri",
  producer: "Üretici",
  admin: "Admin",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
      <DashboardNavbar userEmail={user.email ?? null} />

      <main className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">Profil</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Hesap bilgilerinizi ve tercihlerinizi yönetin.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                Kişisel Bilgiler
              </h2>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                {ROLE_LABEL[profile?.role] ?? "Müşteri"}
              </span>
            </div>
            <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-5 font-serif text-lg font-bold text-stone-900 dark:text-white">
              E-posta Adresi
            </h2>
            <EmailChangeForm currentEmail={user.email ?? ""} />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-5 font-serif text-lg font-bold text-stone-900 dark:text-white">Şifre</h2>
            <PasswordChangeForm />
          </section>
        </div>
      </main>
    </div>
  );
}
