"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

export async function addMemory(formData: FormData) {
  const supabase = await createClient();

  const memorialId = (formData.get("memorialId") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const authorName = (formData.get("authorName") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!authorName || !message || !memorialId) {
    console.error("Zorunlu alanlar eksik:", { memorialId, authorName, message });
    return;
  }

  const { error } = await supabase.from("memories").insert({
    memorial_id: memorialId,
    author_name: authorName,
    message: message,
    type: "text",
  });

  if (error) {
    console.error("Yorum eklenirken hata oluştu:", error);
    return;
  }

  revalidatePath(`/m/${slug}`);
}

export async function deleteMemory(formData: FormData) {
  const supabase = await createClient();

  // Oturum açmış kullanıcı kontrolü
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Yetkisiz işlem: Oturum açılmamış.");
    return;
  }

  const memoryId = (formData.get("memoryId") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();

  if (!memoryId || !slug) {
    console.error("Silme işlemi için gerekli parametreler eksik:", { memoryId, slug });
    return;
  }

  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", memoryId);

  if (error) {
    console.error("Mesaj silinirken hata oluştu:", error);
    return;
  }

  revalidatePath(`/m/${slug}`);
}