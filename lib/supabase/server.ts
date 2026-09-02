import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server Component / Server Action / Route Handler'larda kullanılacak Supabase istemcisi.
 * RLS politikaları auth.uid() üzerinden çalıştığı için bu client'ın cookie'lerdeki
 * session'ı doğru okuyup göndermesi kritik — bu yüzden her request'te yeniden oluşturulur.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component içinden çağrılırsa cookie set edilemez.
            // Session yenilemesi zaten middleware.ts'de yapıldığı için bu güvenle yutulabilir.
          }
        },
      },
    }
  );
}
