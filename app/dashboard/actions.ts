"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 1. Fiziksel Plaket Siparişi
export async function createOrder(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Yetkisiz erişim. Lütfen tekrar giriş yapın.",
      };
    }

    const memorialId = (formData.get("memorialId") as string)?.trim();
    const fullName = (formData.get("fullName") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const shippingAddress = (formData.get("shippingAddress") as string)?.trim();
    const plateType = ((formData.get("plateType") as string) || "metal").trim();

    if (!memorialId || !fullName || !phone || !shippingAddress) {
      return { success: false, error: "Lütfen tüm zorunlu alanları doldurun." };
    }

    const { error } = await (supabase.from("orders") as any).insert({
      memorial_id: memorialId,
      customer_id: user.id,
      user_id: user.id,
      recipient_full_name: fullName,
      full_name: fullName,
      recipient_phone: phone,
      phone: phone,
      shipping_address: shippingAddress,
      plaque_type: plateType,
      plate_type: plateType,
      status: "pending",
    });

    if (error) {
      console.error("createOrder veritabanı hatası:", error);
      return { success: false, error: `Veritabanı hatası: ${error.message}` };
    }

    revalidatePath("/dashboard");
    revalidatePath("/queue");
    return { success: true };
  } catch (err: any) {
    console.error("createOrder beklenmedik hata:", err);
    return {
      success: false,
      error: err.message || "Bilinmeyen bir hata oluştu.",
    };
  }
}

// 2. Anı Silme (FormData ile)
export async function deleteMemorial(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem. Lütfen giriş yapın.");
  }

  const memorialId = (formData.get("id") as string)?.trim();

  if (!memorialId) {
    throw new Error("Anı ID bulunamadı.");
  }

  const { error } = await (supabase.from("memorials") as any)
    .delete()
    .eq("id", memorialId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("deleteMemorial hatası:", error);
    throw new Error(`Anı silinemedi: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/queue");
}