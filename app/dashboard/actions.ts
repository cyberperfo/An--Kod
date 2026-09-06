"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createCheckoutForm } from "@/lib/supabase/iyzico";

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
      shipping_address: shippingAddress,
      status: "pending",
    })
    .select()
    .single();

  if (dbError || !order) {
    console.error("Sipariş veritabanı hatası:", dbError);
    return { success: false, error: "Sipariş kaydedilirken bir hata oluştu." };
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const callbackUrl = `${protocol}://${host}/api/payment/callback`;

  const price = "350.00";
  const nameParts = fullName.trim().split(" ");
  const name = nameParts[0] || "Müşteri";
  const surname = nameParts.slice(1).join(" ") || "Soyadı";

  try {
    const iyziResult = await createCheckoutForm({
      price,
      paidPrice: price,
      basketId: order.id,
      callbackUrl,
      buyer: {
        id: user.id,
        name,
        surname,
        gsmNumber: phone,
        email: user.email || "ornek@email.com",
        identityNumber: "11111111110",
        registrationAddress: shippingAddress,
        ip: headersList.get("x-forwarded-for") || "127.0.0.1",
        city: "Istanbul",
        country: "Turkey",
      },
      shippingAddress: {
        contactName: fullName,
        city: "Istanbul",
        country: "Turkey",
        address: shippingAddress,
      },
      basketItems: [
        {
          id: memorialId,
          name: "Anikod Hatıra Plaketi",
          category1: "Fiziksel Plaket",
          itemType: "PHYSICAL",
          price,
        },
      ],
    });

    console.log("İYZICO SDK CEVABI:", JSON.stringify(iyziResult, null, 2));

    if (iyziResult.status === "success") {
      return {
        success: true,
        checkoutHtmlContent: iyziResult.checkoutFormContent,
        paymentUrl: iyziResult.paymentPageUrl,
      };
    } else {
      return { success: false, error: iyziResult.errorMessage || "Ödeme başlatılamadı." };
    }
  } catch (err: any) {
    console.error("İyzico hata:", err);
    return { success: false, error: "Ödeme servisine bağlanırken bir hata oluştu." };
  }
}

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