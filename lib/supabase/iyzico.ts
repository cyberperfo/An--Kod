import Iyzipay from "iyzipay";

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "",
  secretKey: process.env.IYZICO_SECRET_KEY || "",
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

export interface CheckoutFormRequest {
  price: string;
  paidPrice: string;
  basketId: string;
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
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

export function createCheckoutForm(data: CheckoutFormRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let clientIp = data.buyer.ip;
    if (!clientIp || clientIp === "::1" || clientIp.includes(":")) {
      clientIp = "127.0.0.1";
    }

    const request = {
      locale: "tr",
      conversationId: data.basketId,
      price: data.price,
      paidPrice: data.paidPrice,
      currency: "TRY",
      basketId: data.basketId,
      paymentGroup: "PRODUCT",
      callbackUrl: data.callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        ...data.buyer,
        ip: clientIp,
        identityNumber: "11111111110",
      },
      shippingAddress: data.shippingAddress,
      billingAddress: data.shippingAddress,
      basketItems: data.basketItems,
    };

    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}