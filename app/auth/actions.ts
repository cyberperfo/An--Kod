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

  // Localde 3001 portuna, canlıda (Vercel vb.) ortam değişkenine yönlendir
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // E-posta onayı açıksa kullanıcı oluşur fakat session oluşmaz; login ekranına yönlendir
  if (data.user && !data.session) {
    redirect("/auth/login?message=check_email");
  }

  redirect("/dashboard");
}

// Sayfa import uyumluluğu için
export const register = signUp;

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}