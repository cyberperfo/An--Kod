export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server Action doğrudan sayfa içinde tanımlandı
async function updateOrderStatus(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Yetkisiz işlem.");
  }

  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  const trackingNumber = (formData.get("trackingNumber") as string)?.trim();

  const updateData: Record<string, any> = { status };
  if (trackingNumber !== undefined) {
    updateData.tracking_number = trackingNumber;
  }

  const { data, error } = await (supabase.from("orders") as any)
    .update(updateData)
    .eq("id", orderId)
    .select();

  if (error) {
    console.error("Supabase UPDATE hatası detayı:", error);
    throw new Error(`Güncelleme başarısız: ${error.message}`);
  }

  console.log("Sipariş durumu güncellendi:", data);

  revalidatePath("/queue");
  revalidatePath("/dashboard");
}

export default async function QueuePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Siparişleri anı bilgileriyle birlikte çek
  const { data, error } = await (supabase.from("orders") as any)
    .select(`
      *,
      memorials (
        id,
        full_name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Kuyruk verisi çekilemedi:", error);
  }

  const orders = (data as any[]) || [];

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 antialiased p-6 sm:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Üst Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight">ANIKOD</span>
              <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-medium text-white">
                Üretim Kuyruğu ({orders.length})
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              Lazer kazıma ve metal plaka baskı siparişlerinin takibi.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="self-start sm:self-auto rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            ← Yönetim Paneline Dön
          </Link>
        </div>

        {/* Sipariş Tablosu */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500">
              Şu anda bekleyen veya üretimde olan sipariş bulunmuyor.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold uppercase text-stone-500">
                  <tr>
                    <th className="px-6 py-4">Sipariş / Anı</th>
                    <th className="px-6 py-4">Müşteri & Adres</th>
                    <th className="px-6 py-4">Materyal</th>
                    <th className="px-6 py-4">Durum Güncelle</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => {
                    const memorial = order.memorials;
                    const slug = memorial?.slug;
                    const customerName =
                      order.recipient_full_name || order.full_name || "İsimsiz Müşteri";
                    const customerPhone =
                      order.recipient_phone || order.phone || "Telefon Belirtilmemiş";
                    const plaqueType =
                      order.plaque_type || order.plate_type || "metal";

                    return (
                      <tr key={order.id} className="hover:bg-stone-50/50">
                        {/* Anı Bilgisi */}
                        <td className="px-6 py-4">
                          <p className="font-semibold text-stone-900">
                            {memorial?.full_name || "Silinmiş Anı"}
                          </p>
                          {slug ? (
                            <Link
                              href={`/m/${slug}`}
                              target="_blank"
                              className="text-xs text-stone-400 hover:text-stone-700 underline"
                            >
                              Sayfayı Aç (/{slug})
                            </Link>
                          ) : (
                            <span className="text-xs text-stone-300">Bağlantı yok</span>
                          )}
                          <p className="mt-1 text-[11px] text-stone-400">
                            {new Date(order.created_at).toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Müşteri & Adres */}
                        <td className="px-6 py-4">
                          <p className="font-medium text-stone-900">{customerName}</p>
                          <p className="text-xs text-stone-500">{customerPhone}</p>
                          <p className="mt-1 text-xs text-stone-400 line-clamp-2 max-w-xs">
                            {order.shipping_address}
                          </p>
                        </td>

                        {/* Materyal */}
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-md bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 uppercase">
                            {plaqueType}
                          </span>
                        </td>

                        {/* Durum Değiştirme Formu */}
                        <td className="px-6 py-4">
                          <form action={updateOrderStatus} className="flex flex-col gap-2">
                            <input type="hidden" name="orderId" value={order.id} />

                            <div className="flex items-center gap-2">
                              <select
                                name="status"
                                defaultValue={order.status}
                                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 focus:border-stone-500 focus:outline-none"
                              >
                                <option value="pending">Bekliyor (Pending)</option>
                                <option value="in_production">Üretimde (In Production)</option>
                                <option value="shipped">Kargoda (Shipped)</option>
                                <option value="completed">Tamamlandı (Completed)</option>
                                <option value="cancelled">İptal Edildi (Cancelled)</option>
                              </select>

                              <button
                                type="submit"
                                className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800 cursor-pointer"
                              >
                                Güncelle
                              </button>
                            </div>

                            <input
                              type="text"
                              name="trackingNumber"
                              defaultValue={order.tracking_number || ""}
                              placeholder="Kargo Takip No"
                              className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs focus:border-stone-400 focus:outline-none w-44"
                            />
                          </form>
                        </td>

                        {/* İşlemler / QR & Lazer Baskı */}
                        <td className="px-6 py-4 text-right">
                          {slug ? (
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/queue/print/${slug}`}
                                target="_blank"
                                className="inline-flex items-center rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-800"
                              >
                                Baskı Şablonu
                              </Link>
                              <Link
                                href={`/m/${slug}`}
                                target="_blank"
                                className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                              >
                                QR Gör
                              </Link>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}