"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type InviteMemberState = { error: string | null };

export async function inviteMember(
  _prevState: InviteMemberState,
  formData: FormData
): Promise<InviteMemberState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz işlem. Lütfen giriş yapın." };
  }

  const memorialId = formData.get("memorialId") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!memorialId || !email) {
    return { error: "E-posta adresi zorunludur." };
  }

  // RLS zaten sadece anı sahibinin (veya admin'in) davet ekleyebilmesini
  // garanti eder — burada kullanıcıya daha net bir hata mesajı için erken
  // kontrol de yapılabilirdi, ama gereksiz sorgu yaratmamak için RLS'e bırakıyoruz.
  const { error } = await (supabase.from("memorial_members") as any).insert({
    memorial_id: memorialId,
    invited_email: email,
    role: "family_member",
    status: "invited",
    invited_by: user.id,
  });

  if (error) {
    console.error("Davet eklenemedi:", error);
    return { error: `Davet gönderilemedi: ${error.message}` };
  }

  revalidatePath(`/dashboard/memorials/${memorialId}/members`);
  return { error: null };
}

export async function revokeMember(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem. Lütfen giriş yapın.");
  }

  const memberId = formData.get("memberId") as string;
  const memorialId = formData.get("memorialId") as string;

  if (!memberId) {
    throw new Error("Üye ID bilgisi zorunludur.");
  }

  const { error } = await (supabase.from("memorial_members") as any)
    .update({ status: "revoked" })
    .eq("id", memberId);

  if (error) {
    console.error("Üyelik iptal edilemedi:", error);
    throw new Error(`İptal edilemedi: ${error.message}`);
  }

  if (memorialId) {
    revalidatePath(`/dashboard/memorials/${memorialId}/members`);
  }
}
