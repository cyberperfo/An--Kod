"use client";

import { useActionState } from "react";
import { inviteMember, type InviteMemberState } from "@/app/dashboard/memorials/[id]/members/actions";

const initialState: InviteMemberState = { error: null };

export default function InviteMemberForm({ memorialId }: { memorialId: string }) {
  const [state, formAction, isPending] = useActionState(inviteMember, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name="memorialId" value={memorialId} />
      <div className="flex-1">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
          E-posta ile Davet Et
        </label>
        <input
          required
          type="email"
          name="email"
          placeholder="ornek@eposta.com"
          disabled={isPending}
          className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:border-stone-400 focus:outline-none disabled:bg-stone-100"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {isPending ? "Gönderiliyor..." : "Davet Gönder"}
      </button>

      {state.error && (
        <p className="w-full rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
