import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

const ROLE_HOME: Record<UserRole, string> = {
  customer: "/dashboard",
  producer: "/queue",
  admin: "/admin",
};

/**
 * Supabase'in email doğrulama / magic link / OAuth akışlarının ortak çıkış noktası.
 * signUp'taki emailRedirectTo buraya işaret ediyor: ?code=... parametresiyle gelir,
 * kodu session'a çeviririz, sonra kullanıcının rolüne göre doğru panele yönlendiririz.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next"); // login sırasında middleware'in eklediği orijinal hedef

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_or_expired_code`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role ?? "customer";
  const destination = next && next.startsWith("/") ? next : ROLE_HOME[role];

  return NextResponse.redirect(`${origin}${destination}`);
}
