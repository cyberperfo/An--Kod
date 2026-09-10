export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNavbar from "@/components/DashboardNavbar";
import PendingInviteAcceptButton from "@/components/PendingInviteAcceptButton";
import RevokeMemberButton from "@/components/RevokeMemberButton";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  invited: {
    label: "Bekliyor",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400",
  },
  accepted: {
    label: "Kabul Edildi",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  revoked: {
    label: "İptal Edildi",
    className: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
  },
};

export default async function InvitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Bana gelen davetler: e-postam eşleşiyor ve henüz kabul etmedim.
  const { data: received } = await (supabase.from("memorial_members") as any)
    .select("id, role, status, created_at, memorials ( full_name, slug )")
    .eq("invited_email", user.email)
    .eq("status", "invited")
    .order("created_at", { ascending: false });

  // Gönderdiğim davetler: sahibi olduğum anılara yaptığım tüm davetler.
  const { data: sent } = await (supabase.from("memorial_members") as any)
    .select("id, memorial_id, invited_email, status, created_at, memorials ( full_name )")
    .eq("invited_by", user.id)
    .neq("status", "revoked")
    .order("created_at", { ascending: false });

  const receivedInvites = (received as any[]) || [];
  const sentInvites = (sent as any[]) || [];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
      <DashboardNavbar userEmail={user.email ?? null} />

      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-white">Davetlerim</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Size gelen ve sizin gönderdiğiniz aile üyeliği davetlerini buradan yönetin.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 font-serif text-lg font-bold text-stone-900 dark:text-white">
            Bana Gelen Davetler
          </h2>
          {receivedInvites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
              Bekleyen bir davetiniz yok.
            </div>
          ) : (
            <ul className="space-y-2">
              {receivedInvites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <span className="text-stone-700 dark:text-stone-300">
                    <strong>{invite.memorials?.full_name}</strong> anı sayfasına davet edildiniz.
                  </span>
                  <PendingInviteAcceptButton inviteId={invite.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-serif text-lg font-bold text-stone-900 dark:text-white">
            Gönderdiğim Davetler
          </h2>
          {sentInvites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-6 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
              Henüz kimseyi davet etmediniz. Bir anı sayfasının{" "}
              <span className="font-medium">Aile Üyeleri</span> bölümünden davet gönderebilirsiniz.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {sentInvites.map((invite) => {
                  const status = STATUS_LABEL[invite.status] ?? STATUS_LABEL.invited;
                  return (
                    <li key={invite.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                          {invite.invited_email}
                        </p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                          <Link
                            href={`/dashboard/memorials/${invite.memorial_id}/members`}
                            className="underline underline-offset-2 hover:text-stone-600 dark:hover:text-stone-300"
                          >
                            {invite.memorials?.full_name}
                          </Link>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}>
                          {status.label}
                        </span>
                        {invite.status === "invited" && (
                          <RevokeMemberButton memberId={invite.id} memorialId={invite.memorial_id} />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
