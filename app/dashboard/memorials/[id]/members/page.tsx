import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import InviteMemberForm from "@/components/InviteMemberForm";
import RevokeMemberButton from "@/components/RevokeMemberButton";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  invited: "Davet Gönderildi",
  accepted: "Kabul Edildi",
  revoked: "İptal Edildi",
};

export default async function MembersPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Sadece sayfa sahibi bu ekranı görebilsin — RLS zaten bunu garanti eder,
  // owner_id ile daraltmak 404'ü daha erken ve net verir.
  const { data: memorial, error } = await supabase
    .from("memorials")
    .select("id, full_name")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !memorial) {
    notFound();
  }

  const memorialData = memorial as { id: string; full_name: string };

  const { data: members } = await (supabase.from("memorial_members") as any)
    .select("id, invited_email, role, status, created_at")
    .eq("memorial_id", id)
    .neq("status", "revoked")
    .order("created_at", { ascending: false });

  const memberList = (members as any[]) || [];

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
          <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">Aile Üyeleri</h1>
          <p className="mt-1 text-sm text-stone-500">
            {memorialData.full_name} sayfasını görebilecek aile üyelerini yönetin.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <InviteMemberForm memorialId={id} />
        </div>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white shadow-sm">
          {memberList.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">
              Henüz davet edilen bir aile üyesi yok.
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {memberList.map((member) => (
                <li key={member.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{member.invited_email}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        member.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {STATUS_LABEL[member.status] ?? member.status}
                    </span>
                  </div>
                  <RevokeMemberButton memberId={member.id} memorialId={id} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
