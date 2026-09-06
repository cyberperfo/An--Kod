import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Iyzipay istemcisini fonksiyon içinde başlatarak build aşamasındaki env hatalarını önlüyoruz
  const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || "",
    secretKey: process.env.IYZICO_SECRET_KEY || "",
    uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
  });

  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
      return NextResponse.redirect(new URL("/dashboard?payment=failed", request.url));
    }

    const result: any = await new Promise((resolve, reject) => {
      iyzipay.checkoutForm.retrieve({ token }, (err: any, res: any) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    if (result.status === "success" && result.paymentStatus === "SUCCESS") {
      const orderId = result.basketId;
      const supabase = await createClient();

      await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      return NextResponse.redirect(new URL(`/dashboard?payment=success&order=${orderId}`, request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard?payment=failed", request.url));
    }
  } catch (error) {
    console.error("Callback işlem hatası:", error);
    return NextResponse.redirect(new URL("/dashboard?payment=error", request.url));
  }
}