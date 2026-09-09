import Iyzipay from "iyzipay";

export interface PaymentRequest {
  price: string;
  paidPrice: string;
  basketId: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    gsmNumber: string;
    ip: string;
    city: string;
    country: string;
    registrationAddress: string;
  };
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
  basketItems: {
    id: string;
    name: string;
    category1: string;
    itemType: string;
    price: string;
  }[];
  callbackUrl: string;
}

export interface CheckoutFormResult {
  checkoutFormContent: string;
}

/**
 * Ödemeyi BAŞLATIR (checkout formu oluşturur). Bu form/HTML kullanıcıya
 * gösterilir; ödeme tamamlandığında ilgili sağlayıcı `callbackUrl`'e bir
 * `token` POST eder — sonucun DOĞRULANMASI (ve sipariş durumunun
 * güncellenmesi) app/api/payment/callback/route.ts'te, sağlayıcıya göre
 * ayrı ayrı yapılır. Buradaki fonksiyon SADECE formu oluşturur, hiçbir
 * DB yazması yapmaz.
 */
export async function createCheckoutForm(data: PaymentRequest): Promise<CheckoutFormResult> {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  if (provider === "mock") {
    // Gerçek Iyzico akışında sağlayıcı callbackUrl'e bir `token` POST eder.
    // Mock burada da aynı sözleşmeyi taklit ediyor (gerçek bir form POST'u,
    // GET redirect değil) — böylece callback route'u tek bir tutarlı
    // sözleşmeyle çalışabiliyor.
    const mockToken = `mock_${Date.now()}`;
    return {
      checkoutFormContent: `
        <form method="POST" action="${data.callbackUrl}" style="padding:20px; background:#e6ffed; border:1px solid #b7eb8f; text-align:center; border-radius:8px;">
          <h3 style="margin:0 0 8px;">Güvenli Ödeme Simülasyonu</h3>
          <p style="margin:0 0 16px;">Tutar: ${data.paidPrice} TL</p>
          <input type="hidden" name="token" value="${mockToken}" />
          <input type="hidden" name="orderId" value="${data.basketId}" />
          <input type="hidden" name="mockStatus" value="success" />
          <button type="submit" style="padding:10px 20px; background:#15803d; color:white; border:none; cursor:pointer; border-radius:6px; font-weight:600;">
            Ödemeyi Tamamla ve Onayla
          </button>
        </form>
      `,
    };
  }

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

  if (!apiKey || !secretKey) {
    throw new Error(
      "Iyzico API anahtarları eksik. .env.local dosyasına IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin."
    );
  }

  const iyzipay = new Iyzipay({ apiKey, secretKey, uri });

  // iyzipay paketinin bundled TypeScript tanımları bu kaynak (checkoutFormInitialize)
  // için gerçek REST sözleşmesiyle uyuşmuyor (ör. installments/paymentCard zorunlu
  // gösteriliyor, locale "TR" bekleniyor) — çalışma zamanı davranışı (lib/resources/*.js)
  // doğrulandı, bu yüzden `as any` ile bu hatalı tip tanımları aşılıyor.
  const request: any = {
    locale: "tr",
    conversationId: data.basketId,
    price: data.price,
    paidPrice: data.paidPrice,
    currency: "TRY",
    basketId: data.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: data.callbackUrl,
    enabledInstallments: [1],
    buyer: data.buyer,
    shippingAddress: data.shippingAddress,
    billingAddress: data.shippingAddress,
    basketItems: data.basketItems,
  };

  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        reject(new Error(err.errorMessage || "Iyzico ödeme formu oluşturulamadı."));
        return;
      }
      if (result.status !== "success") {
        reject(new Error(result.errorMessage || "Iyzico ödeme formu oluşturulamadı."));
        return;
      }
      resolve({ checkoutFormContent: result.checkoutFormContent });
    });
  });
}

/** Gerçek Iyzico akışında callback'e gelen token'ı doğrulamak için kullanılır. */
export async function retrieveCheckoutForm(token: string): Promise<any> {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const uri = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

  if (!apiKey || !secretKey) {
    throw new Error("Iyzico API anahtarları eksik.");
  }

  const iyzipay = new Iyzipay({ apiKey, secretKey, uri });

  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve({ token, locale: "tr", conversationId: token } as any, (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
}
