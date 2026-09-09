import { NextResponse } from "next/server";
import { retrieveCheckoutForm } from "@/lib/supabase/payment";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ödeme sağlayıcısının (Iyzico gerçek akışında Iyzico'nun kendi sunucuları,
 * mock modda kendi simüle formumuz) POST ile geri döndüğü rota. Bu istek
 * müşterinin oturum çerezini TAŞIMAZ — bu yüzden admin/service-role
 * istemcisi kullanılır (bkz. lib/supabase/admin.ts). Durum güncellemesinin
 * güvenliği RLS yerine supabase/008_payment_service_role.sql'deki trigger
 * tarafından sağlanır: sadece pending -> paid geçişine izin verilir.
 */
export async function POST(request: Request) {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  try {
    const formData = await request.formData();

    let orderId: string | null = null;
    let isSuccess = false;

    if (provider === "mock") {
      // Mock akışında sunucu-sunucu doğrulaması yok — form kendi POST
      // gövdesinde orderId ve durumu taşıyor (bkz. lib/supabase/payment.ts).
      orderId = formData.get("orderId") as string | null;
      isSuccess = formData.get("mockStatus") === "success";
    } else {
      const token = formData.get("token") as string | null;
      if (!token) {
        return NextResponse.redirect(new URL("/dashboard?payment=failed", request.url));
      }

      // Sonucu Iyzico'nun kendi API'sinden DOĞRULUYORUZ — client'ın/form'un
      // gönderdiği herhangi bir alana güvenilmiyor, bu yüzden gerçek akışta
      // sahte bir "success" POST'u ile ödeme onaylatılamaz.
      const result: any = await retrieveCheckoutForm(token);
      orderId = result.basketId;
      isSuccess = result.status === "success" && result.paymentStatus === "SUCCESS";
    }

    if (!isSuccess || !orderId) {
      return NextResponse.redirect(new URL("/dashboard?payment=failed", request.url));
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await (supabaseAdmin.rpc as any)("advance_order_status", {
      p_order_id: orderId,
      p_new_status: "paid",
    });

    if (error) {
      console.error("Ödeme onaylandı ama sipariş durumu güncellenemedi:", error);
      return NextResponse.redirect(
        new URL(`/dashboard?payment=sync_error&order=${orderId}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/dashboard?payment=success&order=${orderId}`, request.url)
    );
  } catch (error) {
    console.error("Callback işlem hatası:", error);
    return NextResponse.redirect(new URL("/dashboard?payment=error", request.url));
  }
}
