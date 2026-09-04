"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

export async function createMemory(formData: FormData) {
  const supabase = await createClient();

  // Oturum açmış kullanıcıyı al
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = formData.get("fullName") as string;
  const slug = formData.get("slug") as string;
  const birthDate = formData.get("birthDate") as string;
  const deathDate = formData.get("deathDate") as string;
  const bio = formData.get("bio") as string;
  const photoFile = formData.get("photo") as File | null;

  let coverPhotoUrl: string | null = null;

  // Fotoğraf seçilmişse Supabase Storage'a yükle
  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("memorial-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage yükleme hatası:", uploadError);
    } else {
      const { data: publicData } = supabase.storage
        .from("memorial-photos")
        .getPublicUrl(filePath);

      coverPhotoUrl = publicData.publicUrl;
    }
  }

  // Veritabanına kaydet (owner_id ve varsa user_id ikisini de gönderiyoruz)
  const { error: insertError } = await supabase.from("memorials").insert({
    owner_id: user.id,
    user_id: user.id,
    full_name: fullName,
    slug: slug,
    birth_date: birthDate ? birthDate : null,
    death_date: deathDate ? deathDate : null,
    biography: bio,
    cover_photo_url: coverPhotoUrl,
  });

  if (insertError) {
    console.error("Veritabanı ekleme hatası:", insertError);
    throw new Error("Anı sayfası oluşturulamadı.");
  }

  revalidatePath("/dashboard");
  redirect(`/m/${slug}`);
}