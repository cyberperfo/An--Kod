"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateMemoryState = { error: string | null };

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

  let coverPhotoUrl: string | null = null;

  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("memorial-photos")
      .upload(filePath, photoFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Storage yükleme hatası:", uploadError);
      return { error: `Fotoğraf yükleme hatası: ${uploadError.message}` };
    }

    const { data: publicData } = supabase.storage.from("memorial-photos").getPublicUrl(filePath);
    coverPhotoUrl = publicData.publicUrl;
  }

  const { error: insertError } = await (supabase.from("memorials") as any).insert({
    owner_id: user.id,
    user_id: user.id, // Bazı şemalarda user_id olarak geçer
    full_name: fullName,
    slug,
    birth_date: birthDate || null,
    death_date: deathDate || null,
    biography: bio || null,
    bio: bio || null, // Bazı şemalarda bio olarak geçer
    cover_photo_url: coverPhotoUrl,
  });

  if (insertError) {
    console.error("Veritabanı anı ekleme hatası detayı:", insertError);
    return { error: `Anı sayfası oluşturulamadı: ${insertError.message}` };
  }

  revalidatePath("/dashboard");
  redirect(`/m/${slug}`);
}