"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { PLATE_MATERIALS, type PlateMaterial } from "@/lib/plate-materials";
import { createCheckoutForm } from "@/lib/supabase/payment";
import { PLAQUE_ORDER_PRICE_DECIMAL } from "@/lib/pricing";

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

  // DÜZELTME: user_id yerine veritabanı şemasıyla uyumlu olan owner_id kullanıldı
  const { error } = await supabase
    .from("memorials")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

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

  const orderId = (order as { id: string }).id;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "85.34.78.112";

  const { data: memorial } = await (supabase.from("memorials") as any)
    .select("full_name")
    .eq("id", memorialId)
    .single();

  try {
    const { checkoutFormContent } = await createCheckoutForm({
      price: PLAQUE_ORDER_PRICE_DECIMAL,
      paidPrice: PLAQUE_ORDER_PRICE_DECIMAL,
      basketId: orderId,
      buyer: {
        id: user.id,
        name: fullName || "Müşteri",
        surname: "-",
        email: user.email || "musteri@anikod.com",
        gsmNumber: phone,
        ip,
        city: "Istanbul",
        country: "Turkey",
        registrationAddress: shippingAddress,
      },
      shippingAddress: {
        contactName: fullName,
        city: "Istanbul",
        country: "Turkey",
        address: shippingAddress,
      },
      basketItems: [
        {
          id: orderId,
          name: `Fiziksel Plaket — ${memorial?.full_name || "Hatıra Sayfası"}`,
          category1: "Plaket",
          itemType: "PHYSICAL",
          price: PLAQUE_ORDER_PRICE_DECIMAL,
        },
      ],
      callbackUrl: `${siteUrl}/api/payment/callback`,
    });

    revalidatePath("/dashboard");
    return { success: true, orderId, checkoutFormContent };
  } catch (paymentError: any) {
    console.error("Ödeme formu oluşturulamadı:", paymentError);
    // Sipariş zaten "pending" olarak kayıtlı — ödeme kurulamasa da veri kaybı yok,
    // sadece kullanıcıya net bir hata gösteriyoruz.
    return {
      success: false,
      error: paymentError.message || "Ödeme başlatılamadı, lütfen tekrar deneyin.",
    };
  }
}