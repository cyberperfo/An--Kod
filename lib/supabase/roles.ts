import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, UserRole } from "@/types/database.types";

/**
 * Verilen kullanıcının rolünü profiles tablosundan okur.
 * Profil satırı bulunamazsa (ör. trigger henüz çalışmadıysa) null döner —
 * çağıran taraf bunu "yetkisiz" gibi ele almalı.
 */
export async function getUserRole(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return (data as { role: UserRole } | null)?.role ?? null;
}

export function isProducerOrAdmin(role: UserRole | null): boolean {
  return role === "producer" || role === "admin";
}

export function isAdmin(role: UserRole | null): boolean {
  return role === "admin";
}
