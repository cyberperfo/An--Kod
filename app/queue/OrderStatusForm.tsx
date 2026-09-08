"use client";

import { useActionState } from "react";
import { advanceOrderStatus, type AdvanceOrderStatusState } from "./actions";

const NEXT_STEP: Record<string, { status: string; label: string; className: string }> = {
  paid: {
    status: "in_production",
    label: "Üretime Al",
    className: "bg-stone-900 hover:bg-stone-800",
  },
  in_production: {
    status: "shipped",
    label: "Kargoya Ver",
    className: "bg-blue-700 hover:bg-blue-800",
  },
  shipped: {
    status: "completed",
    label: "Tamamla",
    className: "bg-emerald-700 hover:bg-emerald-800",
  },
};

const CANCELLABLE = new Set(["pending", "paid", "in_production"]);

const STATUS_LABEL: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  completed: "Sipariş tamamlandı",
  cancelled: "Sipariş iptal edildi",
};

const CARRIERS = ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "PTT Kargo", "Sürat Kargo"];

const initialState: AdvanceOrderStatusState = { error: null };

export default function OrderStatusForm({
  orderId,
  status,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
}) {
  const [state, formAction, isPending] = useActionState(advanceOrderStatus, initialState);
  const next = NEXT_STEP[status];

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="flex flex-wrap items-center gap-2">
        {next ? (
          <button
            type="submit"
            name="newStatus"
            value={next.status}
            disabled={isPending}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${next.className}`}
          >
            {next.label}
          </button>
        ) : (
          <span className="text-xs text-stone-400">
            {STATUS_LABEL[status] ?? status}
          </span>
        )}

        {CANCELLABLE.has(status) && (
          <button
            type="submit"
            name="newStatus"
            value="cancelled"
            disabled={isPending}
            onClick={(event) => {
              if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) {
                event.preventDefault();
              }
            }}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal Et
          </button>
        )}
      </div>

      {(status === "in_production" || status === "shipped") && (
        <div className="flex flex-wrap gap-2">
          <select
            name="carrier"
            defaultValue={carrier ?? ""}
            className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs focus:border-stone-400 focus:outline-none"
          >
            <option value="">Kargo Firması Seç</option>
            {CARRIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="trackingNumber"
            defaultValue={trackingNumber ?? ""}
            placeholder="Kargo Takip No"
            className="w-40 rounded-lg border border-stone-200 px-2.5 py-1 text-xs focus:border-stone-400 focus:outline-none"
          />
        </div>
      )}

      {state.error && <p className="text-xs font-medium text-red-600">{state.error}</p>}
    </form>
  );
}
