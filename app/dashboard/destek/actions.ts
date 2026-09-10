"use server";

import { createClient } from "@/lib/supabase/server";
import { notifySupportMessage } from "@/lib/notify";

export type SupportFormState = { error: string | null; success: boolean };

export async function submitSupportMessage(
  _prevState: SupportFormState,
  formData: FormData
): Promise<SupportFormState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Yetkisiz işlem. Lütfen giriş yapın.", success: false };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!fullName || !email || !subject || !message) {
    return { error: "Lütfen tüm alanları doldurun.", success: false };
  }

  const { error } = await (supabase.from("support_messages") as any).insert({
    user_id: user.id,
    full_name: fullName,
    email,
    subject,
    message,
  });

  if (error) {
    console.error("Destek mesajı kaydedilemedi:", error);
    return { error: "Mesajınız gönderilemedi, lütfen tekrar deneyin.", success: false };
  }

  await notifySupportMessage({ fullName, email, subject, message });

  return { error: null, success: true };
}
