import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const BUCKET = "memorial-photos";
const DEFAULT_EXPIRY_SECONDS = 60 * 60;

/**
 * memorial-photos bucket'ı private olduğu için fotoğraflar artık ham public
 * URL ile değil, her istekte üretilen geçici signed URL ile sunulur.
 * RLS (can_view_memorial) burada da devrede: yetkisiz bir path için
 * Supabase signed URL üretmeyi reddeder, data null döner.
 */
export async function getSignedPhotoUrl(
  supabase: SupabaseClient<Database>,
  path: string | null | undefined,
  expiresIn: number = DEFAULT_EXPIRY_SECONDS
): Promise<string | null> {
  if (!path) return null;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);

  if (error || !data) return null;
  return data.signedUrl;
}

/** Dashboard gibi çoklu-kart listelerde tek tek istek atmamak için toplu çözümleme. */
export async function getSignedPhotoUrls(
  supabase: SupabaseClient<Database>,
  paths: (string | null | undefined)[],
  expiresIn: number = DEFAULT_EXPIRY_SECONDS
): Promise<Record<string, string>> {
  const validPaths = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  if (validPaths.length === 0) return {};

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(validPaths, expiresIn);
  if (error || !data) return {};

  return Object.fromEntries(
    data
      .filter((d): d is typeof d & { signedUrl: string; path: string } => Boolean(d.signedUrl && d.path))
      .map((d) => [d.path, d.signedUrl])
  );
}

export function buildPhotoUploadPath(userId: string, memorialId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  return `${userId}/${memorialId}/${Date.now()}.${ext}`;
}
