import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * SADECE sunucu-sunucu webhook/callback rotalarında kullan (ör.
 * app/api/payment/callback). RLS'i tamamen bypass eder — bir Server
 * Component'e, Server Action'a veya istemciye ASLA aktarma.
 *
 * Ödeme callback'i (Iyzico gerçek akışında) Iyzico'nun kendi
 * sunucularından gelir; müşterinin oturum çerezini taşımaz. Bu yüzden
 * auth.uid() tabanlı normal Supabase client'ı burada işe yaramaz —
 * sipariş durumunu güncellemek için service_role gerekir. Buna karşılık
 * supabase/008_payment_service_role.sql'deki trigger, sadece pending ->
 * paid geçişine ve sadece service_role'e izin verir; başka hiçbir
 * durum/rol kombinasyonunu bu bypass'la geçirmez.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY tanımlı değil. Supabase Dashboard > Project Settings > " +
        "API > service_role anahtarını .env.local dosyasına SUPABASE_SERVICE_ROLE_KEY " +
        "olarak ekleyin (bu anahtarı asla NEXT_PUBLIC_ ile işaretlemeyin veya istemciye göndermeyin)."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
