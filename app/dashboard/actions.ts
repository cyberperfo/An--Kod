"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PLATE_MATERIALS, type PlateMaterial } from "@/lib/plate-materials";

export async function deleteMemorial(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem. Lütfen giriş yapın.");
  }

  const id = formData.get("id") as string;
  if (!id) {
    throw new Error("Hatıra ID bilgisi bulunamadı.");
  }

  const { error } = await supabase
    .from("memorials")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Hatıra silinemedi:", error);
    throw new Error(`Silme başarısız: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

export async function acceptInvite(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem. Lütfen giriş yapın.");
  }

  const inviteId = formData.get("inviteId") as string;
  if (!inviteId) {
    throw new Error("Davet ID bilgisi bulunamadı.");
  }

  // RLS ("memorial_members: accept own invite") sadece invited_email,
  // giriş yapan kullanıcının e-postasıyla eşleşiyorsa bu güncellemeye izin verir.
  const { error } = await (supabase.from("memorial_members") as any)
    .update({ status: "accepted", user_id: user.id })
    .eq("id", inviteId);

  if (error) {
    console.error("Davet kabul edilemedi:", error);
    throw new Error(`Davet kabul edilemedi: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Oturum açmanız gerekiyor." };
  }

  const memorialId = formData.get("memorialId") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const plateType = formData.get("plateType") as string;
  const plateMaterial = formData.get("plateMaterial") as string;
  const shippingAddress = formData.get("shippingAddress") as string;

  if (!memorialId || !fullName || !phone || !shippingAddress) {
    return { success: false, error: "Tüm alanları doldurmanız gerekmektedir." };
  }

  const { data: order, error: dbError } = await supabase
    .from("orders")
    .insert({
      memorial_id: memorialId,
      user_id: user.id,
      customer_id: user.id,
      full_name: fullName,
      recipient_full_name: fullName,
      phone: phone,
      plate_type: plateType || "metal",
      plate_material: PLATE_MATERIALS.includes(plateMaterial as PlateMaterial)
        ? plateMaterial
        : "stainless_steel",
      shipping_address: shippingAddress,
      status: "pending",
    })
    .select()
    .single();

  if (dbError || !order) {
    console.error("Sipariş veritabanı hatası:", dbError);
    return { success: false, error: "Sipariş kaydedilirken bir hata oluştu." };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Siparişiniz başarıyla oluşturuldu." };
}
