"use client";

import { useTransition } from "react";
import { acceptInvite } from "@/app/dashboard/actions";

export default function PendingInviteAcceptButton({ inviteId }: { inviteId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    const formData = new FormData();
    formData.set("inviteId", inviteId);
    startTransition(async () => {
      try {
        await acceptInvite(formData);
      } catch (err: any) {
        alert(err.message || "Davet kabul edilirken bir hata oluştu.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleAccept}
      disabled={isPending}
      className="cursor-pointer rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:opacity-50"
    >
      {isPending ? "Kabul Ediliyor..." : "Kabul Et"}
    </button>
  );
}
