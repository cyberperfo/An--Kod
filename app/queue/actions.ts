"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRole, isProducerOrAdmin } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

export type AdvanceOrderStatusState = {
  error: string | null;
};

/**
 * Sipariş durumunu ilerletir. Geçerli/geçersiz geçiş kuralları ve rol
 * kısıtı asıl olarak supabase/004_order_status_state_machine.sql'deki
 * trigger'da uygulanır (RPC bunu atlatamaz) — buradaki erken kontrol
 * sadece kullanıcıya daha hızlı ve net bir hata mesajı göstermek içindir.
 */
export async function advanceOrderStatus(
  _prevState: AdvanceOrderStatusState,
  formData: FormData
): Promise<AdvanceOrderStatusState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz işlem. Lütfen giriş yapın." };
  }

  const role = await getUserRole(supabase, user.id);
  if (!isProducerOrAdmin(role)) {
    return { error: "Bu işlem için üretici veya admin yetkisi gereklidir." };
  }

  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("newStatus") as string;
  const trackingNumber = (formData.get("trackingNumber") as string)?.trim() || null;
  const carrier = (formData.get("carrier") as string)?.trim() || null;

  if (!orderId || !newStatus) {
    return { error: "Sipariş ID ve yeni durum bilgisi zorunludur." };
  }

  // `orders` tablosunun generic tip zincirinde projede önceden var olan bir
  // sorun nedeniyle (bkz. app/api/payment/callback/route.ts, app/dashboard/actions.ts)
  // burada da aynı şekilde `as any` ile aşılıyoruz.
  const { error } = await (supabase.rpc as any)("advance_order_status", {
    p_order_id: orderId,
    p_new_status: newStatus,
    p_tracking_number: trackingNumber,
    p_carrier: carrier,
  });

  if (error) {
    console.error("Sipariş durumu güncellenemedi:", error);
    return { error: error.message };
  }

  revalidatePath("/queue");
  revalidatePath("/dashboard");
  return { error: null };
}
