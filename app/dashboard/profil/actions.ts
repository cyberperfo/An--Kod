"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileFormState = { error: string | null; success: boolean };

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz işlem. Lütfen giriş yapın.", success: false };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!fullName) {
    return { error: "Ad Soyad alanı zorunludur.", success: false };
  }

  // RLS ("profiles: update own") + kolon seviyesi GRANT (sadece full_name/phone)
  // bu güncellemenin kapsamını zaten güvenceye alıyor.
  const { error } = await (supabase.from("profiles") as any)
    .update({ full_name: fullName, phone })
    .eq("id", user.id);

  if (error) {
    console.error("Profil güncellenemedi:", error);
    return { error: "Profil güncellenemedi, lütfen tekrar deneyin.", success: false };
  }

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

export async function updateEmail(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz işlem. Lütfen giriş yapın.", success: false };
  }

  const email = (formData.get("email") as string)?.trim();
  if (!email) {
    return { error: "E-posta adresi zorunludur.", success: false };
  }

  if (email === user.email) {
    return { error: "Bu zaten mevcut e-posta adresiniz.", success: false };
  }

  // Supabase her iki adrese de onay e-postası gönderir; değişiklik
  // sadece yeni adres onaylandığında kesinleşir.
  const { error } = await supabase.auth.updateUser({ email });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}

export async function updatePassword(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz işlem. Lütfen giriş yapın.", success: false };
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { error: "Şifre en az 8 karakter olmalıdır.", success: false };
  }

  if (password !== confirmPassword) {
    return { error: "Şifreler eşleşmiyor.", success: false };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message, success: false };
  }

  return { error: null, success: true };
}
