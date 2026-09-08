"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildPhotoUploadPath } from "@/lib/supabase/media";
import type { MemorialVisibility } from "@/types/database.types";

export type CreateMemoryState = { error: string | null };

const VALID_VISIBILITY: MemorialVisibility[] = ["public", "family_only", "private"];

function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createMemory(
  _prevState: CreateMemoryState,
  formData: FormData
): Promise<CreateMemoryState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const birthDate = formData.get("birthDate") as string;
  const deathDate = formData.get("deathDate") as string;
  const bio = (formData.get("bio") as string)?.trim();
  const photoFile = formData.get("photo") as File | null;
  const rawVisibility = formData.get("visibility") as string;
  const visibility: MemorialVisibility = VALID_VISIBILITY.includes(
    rawVisibility as MemorialVisibility
  )
    ? (rawVisibility as MemorialVisibility)
    : "public";

  if (!fullName) {
    return { error: "Ad Soyad alanı zorunludur." };
  }

  const desiredSlug = slugify(rawSlug || fullName) || "hatira";
  let slug = desiredSlug;

  const { data: existing } = await supabase
    .from("memorials")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${desiredSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // Fotoğrafın storage yolu memorial_id'yi içermeli (RLS bunu kullanarak
  // "bu fotoğraf hangi anıya ait, o anı bu kullanıcıya görünür mü" diye
  // kontrol ediyor) — bu yüzden önce satırı fotoğrafsız oluşturup id'yi
  // alıyoruz, sonra o id'yle yüklüyoruz.
  const { data: inserted, error: insertError } = await (supabase.from("memorials") as any)
    .insert({
      owner_id: user.id,
      user_id: user.id,
      full_name: fullName,
      slug,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      biography: bio || null,
      visibility,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Veritabanı anı ekleme hatası detayı:", insertError);
    return { error: `Anı sayfası oluşturulamadı: ${insertError?.message}` };
  }

  const memorialId = (inserted as { id: string }).id;

  if (photoFile && photoFile.size > 0) {
    const filePath = buildPhotoUploadPath(user.id, memorialId, photoFile.name);

    const { error: uploadError } = await supabase.storage
      .from("memorial-photos")
      .upload(filePath, photoFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Storage yükleme hatası:", uploadError);
      return {
        error: `Anı sayfası oluşturuldu ama fotoğraf yüklenemedi: ${uploadError.message}. Düzenle sayfasından tekrar deneyebilirsiniz.`,
      };
    }

    await (supabase.from("memorials") as any)
      .update({ cover_photo_path: filePath })
      .eq("id", memorialId);
  }

  revalidatePath("/dashboard");
  redirect(`/m/${slug}`);
}