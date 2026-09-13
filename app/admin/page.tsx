import { requireRole } from "@/lib/auth/roles";

export default async function AdminPage() {
  const { supabase, user } = await requireRole(["admin"]);
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, recipient_full_name, payment_status, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Yönetim</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">Sipariş Yönetimi</h1>
          <p className="mt-1 text-sm text-stone-500">{user.email}</p>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Siparişler yüklenemedi.
          </p>
        ) : !orders?.length ? (
          <p className="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
            Henüz sipariş bulunmuyor.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Sipariş</th>
                  <th className="px-4 py-3">Alıcı</th>
                  <th className="px-4 py-3">Ödeme</th>
                  <th className="px-4 py-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">{order.recipient_full_name}</td>
                    <td className="px-4 py-3">{order.payment_status}</td>
                    <td className="px-4 py-3">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}