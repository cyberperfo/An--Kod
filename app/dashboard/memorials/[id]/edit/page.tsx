import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditMemorialForm from "@/components/EditMemorialForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMemorialPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Sadece sayfa sahibi düzenleyebilsin — RLS zaten bunu garanti eder,
  // ama sorguyu owner_id ile daraltmak 404'ü daha erken ve net verir.
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  // TS tip hatasını atlamak için veriyi any olarak tanımlıyoruz
  const memorial = data as any;

  return (
    <div className="min-h-screen bg-stone-50 p-6 text-stone-900 antialiased sm:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          >
            ← Dashboard&apos;a Dön
          </Link>
          <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">
            Anı Sayfasını Düzenle
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {memorial.full_name} için bilgileri güncelleyin.
          </p>
        </div>

        <EditMemorialForm memorial={memorial} />
      </div>
    </div>
  );
}