"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateMemorialState = { error: string | null };

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
  const existingPhotoUrl = (formData.get("existingPhotoUrl") as string) || null;

  if (!id || !fullName) {
    return { error: "Ad Soyad alanı zorunludur." };
  }

  let coverPhotoUrl = existingPhotoUrl;

  // Yeni fotoğraf seçildiyse yükle, seçilmediyse mevcut fotoğrafı koru.
  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("memorial-photos")
      .upload(filePath, photoFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Storage yükleme hatası:", uploadError);
      return { error: "Fotoğraf yüklenirken bir sorun oluştu, lütfen tekrar deneyin." };
    }

    const { data: publicData } = supabase.storage.from("memorial-photos").getPublicUrl(filePath);
    coverPhotoUrl = publicData.publicUrl;
  }

  const { data: updated, error: updateError } = await supabase
    .from("memorials")
    .update({
      full_name: fullName,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      biography: bio || null,
      cover_photo_url: coverPhotoUrl,
    })
    .eq("id", id)
    .eq("owner_id", user.id) // savunma amaçlı ikinci katman, asıl yetki RLS'te
    .select("slug")
    .single();

  if (updateError || !updated) {
    console.error("Güncelleme hatası:", updateError);
    return { error: "Değişiklikler kaydedilemedi, lütfen tekrar deneyin." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/m/${updated.slug}`);
  redirect("/dashboard");
}
