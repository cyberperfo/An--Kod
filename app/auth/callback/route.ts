import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

const ROLE_HOME: Record<UserRole, string> = {
  customer: "/dashboard",
  producer: "/queue",
  admin: "/admin",
};

/**
 * Supabase email doğrulama / magic link / OAuth callback rotası.
 * code parametresini session'a çevirir ve rol/hedef yönlendirmesini yapar.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // .env içindeki NEXT_PUBLIC_SITE_URL (http://localhost:3001) önceliklidir.
  // Port sapmalarını (3000 vs.) tamamen engeller.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const fallbackOrigin = new URL(request.url).origin;

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (forwardedHost ? `https://${forwardedHost}` : fallbackOrigin);

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=invalid_or_expired_code`
    );
  }

  // Profil tablosundan rol kontrolü
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = (profile?.role as UserRole) ?? "customer";
  const destination =
    next && next.startsWith("/") ? next : (ROLE_HOME[role] ?? "/dashboard");

  return NextResponse.redirect(`${origin}${destination}`);
}