"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildPhotoUploadPath } from "@/lib/supabase/media";
import type { MemorialVisibility } from "@/types/database.types";

export type UpdateMemorialState = { error: string | null };

const VALID_VISIBILITY: MemorialVisibility[] = ["public", "family_only", "private"];

export async function updateMemorial(
  _prevState: UpdateMemorialState,
  formData: FormData
): Promise<UpdateMemorialState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const id = formData.get("id") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const birthDate = formData.get("birthDate") as string;
  const deathDate = formData.get("deathDate") as string;
  const bio = (formData.get("bio") as string)?.trim();
  const photoFile = formData.get("photo") as File | null;
  const existingPhotoPath = (formData.get("existingPhotoPath") as string) || null;
  const rawVisibility = formData.get("visibility") as string;
  const visibility: MemorialVisibility = VALID_VISIBILITY.includes(
    rawVisibility as MemorialVisibility
  )
    ? (rawVisibility as MemorialVisibility)
    : "public";

  if (!id || !fullName) {
    return { error: "Ad Soyad alanı zorunludur." };
  }

  let coverPhotoPath = existingPhotoPath;

  // Yeni fotoğraf seçildiyse yükle, seçilmediyse mevcut fotoğrafı koru.
  if (photoFile && photoFile.size > 0) {
    const filePath = buildPhotoUploadPath(user.id, id, photoFile.name);

    const { error: uploadError } = await supabase.storage
      .from("memorial-photos")
      .upload(filePath, photoFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Storage yükleme hatası:", uploadError);
      return { error: "Fotoğraf yüklenirken bir sorun oluştu, lütfen tekrar deneyin." };
    }

    coverPhotoPath = filePath;
  }

  const { data: updated, error: updateError } = await (supabase.from("memorials") as any)
    .update({
      full_name: fullName,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      biography: bio || null,
      cover_photo_path: coverPhotoPath,
      visibility,
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("slug")
    .single();

  if (updateError || !updated) {
    console.error("Güncelleme hatası:", updateError);
    return { error: "Değişiklikler kaydedilemedi, lütfen tekrar deneyin." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/m/${(updated as any).slug}`);
  redirect("/dashboard");
}