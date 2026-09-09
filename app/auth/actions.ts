"use server";

import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthActionState = {
  error: string | null;
};

export async function login(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // GoTrue, e-postası henüz doğrulanmamış bir hesapla girişte bu mesajı döner.
    // Kullanıcıyı hatayla baş başa bırakmak yerine doğrudan kod giriş ekranına yönlendiriyoruz.
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUp(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // E-posta onayı açıksa kullanıcı oluşur fakat session oluşmaz — hesap
  // 6 haneli kod doğrulanana kadar aktif değildir (bkz. app/auth/verify).
  if (data.user && !data.session) {
    redirect(`/auth/verify?email=${encodeURIComponent(email)}`);
  }

  redirect("/dashboard");
}

// Sayfa import uyumluluğu için
export const register = signUp;

export type VerifyOtpState = { error: string | null };

export async function verifySignupOtp(
  prevState: VerifyOtpState,
  formData: FormData
): Promise<VerifyOtpState> {
  const email = (formData.get("email") as string)?.trim();
  const token = (formData.get("token") as string)?.trim();

  if (!email || !token) {
    return { error: "E-posta ve doğrulama kodu zorunludur." };
  }

  if (!/^\d{6}$/.test(token)) {
    return { error: "Doğrulama kodu 6 haneli olmalıdır." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return { error: "Kod geçersiz veya süresi dolmuş. Lütfen tekrar deneyin." };
  }

  redirect("/dashboard");
}

export type ResendOtpState = { error: string | null; sent: boolean };

export async function resendSignupOtp(
  prevState: ResendOtpState,
  formData: FormData
): Promise<ResendOtpState> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "E-posta adresi bulunamadı.", sent: false };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: error.message, sent: false };
  }

  return { error: null, sent: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
