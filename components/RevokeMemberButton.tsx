"use client";

import { useTransition } from "react";
import { revokeMember } from "@/app/dashboard/memorials/[id]/members/actions";

export default function RevokeMemberButton({
  memberId,
  memorialId,
}: {
  memberId: string;
  memorialId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRevoke = () => {
    if (!confirm("Bu üyeliği iptal etmek istediğinize emin misiniz?")) return;

    const formData = new FormData();
    formData.set("memberId", memberId);
    formData.set("memorialId", memorialId);

    startTransition(async () => {
      try {
        await revokeMember(formData);
      } catch (err: any) {
        alert(err.message || "İptal edilirken bir hata oluştu.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={isPending}
      className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {isPending ? "İptal Ediliyor..." : "İptal Et"}
    </button>
  );
}
