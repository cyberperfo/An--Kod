"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMemory(formData: FormData) {
  const supabase = await createClient();

  // Aktif oturum açmış kullanıcıyı al
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bu işlemi yapmak için giriş yapmış olmalısınız.");
  }

  const fullName = formData.get("fullName") as string;
  const rawSlug = formData.get("slug") as string;
  const birthDate = formData.get("birthDate") as string;
  const deathDate = formData.get("deathDate") as string;
  const bio = formData.get("bio") as string;

  // Slug boşsa isimden otomatik slug türet
  const slug =
    rawSlug?.trim() ||
    fullName
      .toLowerCase()
      .trim()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

  // 'memorials' tablosuna doğru sütun isimleriyle kayıt
  const { error } = await supabase.from("memorials").insert([
    {
      owner_id: user.id,
      full_name: fullName,
      slug: slug,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      biography: bio || "",
    },
  ]);

  if (error) {
    console.error("Veri eklenirken hata oluştu:", error.message);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}