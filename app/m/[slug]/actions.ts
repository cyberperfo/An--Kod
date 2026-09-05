"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// 1. Ziyaretçi Mesajı Ekleme
export async function addMemory(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const memorialId = (formData.get("memorialId") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const authorName = (formData.get("authorName") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!authorName || !message || !memorialId) {
      return {
        success: false,
        error: "Lütfen adınızı ve mesajınızı eksiksiz girin.",
      };
    }

    const { error } = await (supabase.from("memories") as any).insert({
      memorial_id: memorialId,
      author_name: authorName,
      message: message,
      type: "text",
    });

    if (error) {
      console.error("Yorum eklenirken hata oluştu:", error);
      return {
        success: false,
        error: `Mesaj iletilemedi: ${error.message}`,
      };
    }

    if (slug) {
      revalidatePath(`/m/${slug}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("addMemory beklenmedik hata:", err);
    return {
      success: false,
      error: err.message || "Bilinmeyen bir hata oluştu.",
    };
  }
}

// 2. Ziyaretçi Mesajı Silme (Sayfa Sahibi İçin)
export async function deleteMemory(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem: Oturum açılmamış.");
  }

  const memoryId = (formData.get("memoryId") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();

  if (!memoryId || !slug) {
    throw new Error("Silme parametreleri eksik.");
  }

  // Güvenlik doğrulaması: Sadece anı sayfasının sahibi silebilir
  const { data: targetMemory, error: fetchError } = await (supabase.from("memories") as any)
    .select(`
      memorial_id,
      memorials (
        id,
        owner_id,
        user_id
      )
    `)
    .eq("id", memoryId)
    .single();

  if (fetchError || !targetMemory?.memorials) {
    console.error("Hedef anı kaydı bulunamadı:", fetchError);
    throw new Error("Mesaj veya anı kaydı doğrulanamadı.");
  }

  const memorial = targetMemory.memorials;
  const ownerId = memorial.owner_id || memorial.user_id;

  if (ownerId !== user.id) {
    throw new Error("Bu mesajı silme yetkiniz bulunmuyor.");
  }

  const { error } = await (supabase.from("memories") as any)
    .delete()
    .eq("id", memoryId);

  if (error) {
    console.error("Mesaj silinemedi:", error);
    throw new Error(`Mesaj silinemedi: ${error.message}`);
  }

  revalidatePath(`/m/${slug}`);
}