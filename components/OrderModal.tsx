"use client";

import { useState } from "react";
import { createOrder } from "@/app/dashboard/actions";
import { useRouter } from "next/navigation";
import { PLATE_MATERIALS, PLATE_MATERIAL_INFO, type PlateMaterial } from "@/lib/plate-materials";
import { PLAQUE_ORDER_PRICE_TRY } from "@/lib/pricing";

interface OrderModalProps {
  memorialId: string;
  memorialName: string;
}

export default function OrderModal({ memorialId, memorialName }: OrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [material, setMaterial] = useState<PlateMaterial>("stainless_steel");
  const [checkoutFormContent, setCheckoutFormContent] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createOrder(formData);

    if (res?.success && res.checkoutFormContent) {
      // Sipariş oluşturuldu, şimdi ödeme adımını göster.
      setCheckoutFormContent(res.checkoutFormContent);
      setLoading(false);
      router.refresh();
    } else {
      setErrorMessage(res?.error || "Sipariş oluşturulurken bir hata oluştu.");
      setLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setCheckoutFormContent(null);
    setErrorMessage(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-800 cursor-pointer"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Fiziksel Plaket Siparişi
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl transition-all my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Fiziksel Plaket Siparişi</h3>
                <p className="text-xs text-stone-500">{memorialName} için özel QR plaka</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                {errorMessage}
              </div>
            )}

            {checkoutFormContent ? (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-xs text-stone-500">
                  Siparişiniz oluşturuldu. Ödemeyi tamamlamak için aşağıdaki adımı izleyin.
                </p>
                <div dangerouslySetInnerHTML={{ __html: checkoutFormContent }} />
                <button
                  type="button"
                  onClick={handleClose}
                  className="self-start rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 cursor-pointer"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="memorialId" value={memorialId} />

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ad Soyad</label>
                <input
                  name="fullName"
                  required
                  placeholder="Teslim alacak kişi"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Telefon</label>
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-400 focus:outline-none"
                />
              </div>

              <input type="hidden" name="plateType" value="metal" />

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Plaka Materyali ve Rengi
                </label>

                {/* Canlı Önizleme */}
                <div
                  className={`mb-3 flex aspect-[10/7] w-full flex-col items-center justify-center rounded-2xl border border-stone-200 p-4 text-center shadow-inner transition-colors ${PLATE_MATERIAL_INFO[material].previewClassName}`}
                >
                  <p
                    className={`font-serif text-sm font-bold ${PLATE_MATERIAL_INFO[material].textClassName}`}
                  >
                    {memorialName}
                  </p>
                  <div className="mt-2 h-8 w-8 rounded-md border border-black/10 bg-black/10" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PLATE_MATERIALS.map((value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer flex-col gap-0.5 rounded-xl border border-stone-200 p-2.5 text-[11px] transition-colors hover:bg-stone-50 has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50"
                    >
                      <span className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="plateMaterial"
                          value={value}
                          checked={material === value}
                          onChange={() => setMaterial(value)}
                          className="accent-stone-900"
                        />
                        <span className="font-semibold text-stone-800">
                          {PLATE_MATERIAL_INFO[value].label}
                        </span>
                      </span>
                      <span className="text-stone-500">{PLATE_MATERIAL_INFO[value].description}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teslimat Adresi</label>
                <textarea
                  name="shippingAddress"
                  required
                  rows={3}
                  placeholder="Mahalle, Cadde, Sokak, İlçe, İl..."
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-stone-400 focus:outline-none"
                />
              </div>

              <div className="mt-2 flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-50 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  {loading
                    ? "Sipariş Oluşturuluyor..."
                    : `Siparişi Tamamla (₺${PLAQUE_ORDER_PRICE_TRY})`}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}