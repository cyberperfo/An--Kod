"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function deleteMemorial(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const id = (formData.get("id") as string)?.trim();
  if (!id) return;

  // .eq("owner_id", user.id) burada savunma amaçlı bir ikinci katman —
  // asıl yetkilendirme RLS'te (memorials: owner delete policy).
  const { error } = await supabase
    .from("memorials")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Anı sayfası silinirken hata oluştu:", error);
    return;
  }

  revalidatePath("/dashboard");
}
