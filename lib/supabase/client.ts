import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Client Component'lerde kullanılacak Supabase istemcisi.
 * Her çağrıda yeni instance döner — Supabase SSR paketinin önerdiği desen budur,
 * singleton tutmaya çalışmak (özellikle Next.js dev modunda) session tutarsızlıklarına yol açabilir.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
