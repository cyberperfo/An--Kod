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

export async function processPayment(data: PaymentRequest): Promise<any> {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  if (provider === "mock") {
    // API bağımlılığını tamamen ortadan kaldıran kararlı ve hızlı simülasyon yanıtı
    console.log("Mock Ödeme Modu Aktif: API bağlantısı atlandı.");
    return {
      status: "success",
      paymentId: "mock_payment_" + Date.now(),
      checkoutFormContent: `<div style="padding:20px; background:#e6ffed; border:1px solid #b7eb8f; text-align:center;">
        <h3>Güvenli Ödeme Simülasyonu</h3>
        <p>Tutar: ${data.paidPrice} TL</p>
        <button onclick="window.location.href='${data.callbackUrl}?status=success'" style="padding:10px 20px; background:green; color:white; border:none; cursor:pointer; border-radius:5px;">
          Ödemeyi Tamamla ve Onayla
        </button>
      </div>`,
    };
  }

  // Eğer ileride 'iyzico' moduna geçilirse burası çalışır
  throw new Error("İyzico API aktif edildi ancak sandbox geçersizliği nedeniyle devre dışı bırakıldı.");
}