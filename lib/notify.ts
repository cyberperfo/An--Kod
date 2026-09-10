/**
 * Destek mesajlarını, RESEND_API_KEY ve SUPPORT_NOTIFICATION_EMAIL env
 * değişkenleri tanımlıysa Resend'in HTTP API'si üzerinden e-postayla
 * bildirir. Tanımlı değilse sessizce atlar — mesaj zaten support_messages
 * tablosunda kalıcı olarak saklanıyor, e-posta bildirimi bir bonus.
 *
 * Neden Resend: SMTP client kurmadan (kimlik bilgisi/port yönetimi
 * gerektirmeden) tek bir POST isteğiyle çalışır, üstelik ücretsiz katmanı var.
 * Kurulum: https://resend.com adresinden API key alıp .env.local dosyasına
 * RESEND_API_KEY ve bildirimlerin gideceği SUPPORT_NOTIFICATION_EMAIL
 * değerlerini eklemeniz yeterli.
 */
export async function notifySupportMessage(input: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    console.log(
      "[destek] RESEND_API_KEY/SUPPORT_NOTIFICATION_EMAIL tanımlı değil, e-posta gönderilmedi (mesaj DB'de saklandı)."
    );
    return { sent: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ANIKOD Destek <destek@anikod.com>",
        to: [to],
        reply_to: input.email,
        subject: `[Destek] ${input.subject}`,
        text: `Gönderen: ${input.fullName} <${input.email}>\n\n${input.message}`,
      }),
    });

    if (!response.ok) {
      console.error("Resend e-posta gönderimi başarısız:", await response.text());
      return { sent: false };
    }

    return { sent: true };
  } catch (error) {
    console.error("Resend isteği başarısız:", error);
    return { sent: false };
  }
}
