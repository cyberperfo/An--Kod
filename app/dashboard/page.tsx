import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen p-8 bg-stone-50 text-stone-900">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <h1 className="text-2xl font-bold mb-2">Hoş Geldin!</h1>
        <p className="text-sm text-stone-600 mb-6">Giriş yapılan hesap: {user.email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-stone-800"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  );
}