"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem. Lütfen giriş yapın.");
  }

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  const trackingNumber = (formData.get("trackingNumber") as string)?.trim();

  if (!orderId || !status) {
    throw new Error("Sipariş ID ve durum bilgisi zorunludur.");
  }

  const updateData: Record<string, any> = { status };
  if (trackingNumber !== undefined && trackingNumber !== "") {
    updateData.tracking_number = trackingNumber;
  }

  const { error } = await (supabase.from("orders") as any)
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    console.error("Sipariş durumu güncellenemedi:", error);
    throw new Error(`Güncelleme başarısız: ${error.message}`);
  }

  revalidatePath("/queue");
  revalidatePath("/dashboard");
}