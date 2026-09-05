import GuestbookForm from "@/components/GuestbookForm";
import QRCodeCard from "@/components/QRCodeCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteMemory } from "./actions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function PublicMemoryPage(props: Props) {
  const resolvedParams = await Promise.resolve(props.params);
  const slug = resolvedParams.slug;
  const supabase = await createClient();

  // Supabase'den anı sayfasını çek
  const { data: rawMemory, error } = await (supabase.from("memorials") as any)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !rawMemory) {
    notFound();
  }

  const memory = rawMemory;

  // Giriş yapmış kullanıcıyı kontrol et ve sayfa sahibi olup olmadığını belirle
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = Boolean(
    user && (user.id === memory.owner_id || user.id === memory.user_id)
  );

  // Bu sayfaya ait gerçek ziyaretçi mesajlarını çek (en yeniden eskiye)
  const { data: notes } = await (supabase.from("memories") as any)
    .select("*")
    .eq("memorial_id", memory.id)
    .order("created_at", { ascending: false });

  const memoryList = (notes as any[]) || [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 antialiased selection:bg-stone-200">
      {/* Üst Başlık */}
      <header className="border-b border-stone-200/80 bg-white/70 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4">
          <span className="font-serif text-sm tracking-widest text-stone-500 uppercase">
            ANIKOD HATIRA SAYFASI
          </span>

          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                href="/dashboard"
                className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100"
              >
                Yönetim Paneli
              </Link>
            )}
            <span className="text-xs text-stone-400">/{slug}</span>
          </div>
        </div>
      </header>

      {/* Profil ve Bilgiler */}
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
          {/* Fotoğraf Alanı */}
          <div className="flex flex-col items-center border-b border-stone-100 px-6 pt-10 pb-8 text-center">
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-stone-100 shadow-md">
              {memory.cover_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={memory.cover_photo_url}
                  alt={memory.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <svg
                  className="h-20 w-20 text-stone-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              )}
            </div>

            <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-stone-900">
              {memory.full_name}
            </h1>
            <p className="mt-1 font-serif text-sm tracking-widest text-stone-500">
              {memory.birth_date || "—"} — {memory.death_date || "—"}
            </p>
          </div>

          {/* Biyografi */}
          <div className="px-6 py-8 sm:px-10">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Hatırası ve Hayatı
            </h2>
            <p className="mt-3 leading-relaxed text-stone-600 whitespace-pre-line">
              {memory.biography || "Henüz bir biyografi veya anı yazısı eklenmemiş."}
            </p>
          </div>
        </div>

        {/* QR Kod Alanı */}
        <section className="mt-10">
          <h3 className="font-serif text-xl font-bold text-stone-900 text-center mb-4">
            Hatıra Sayfası Karekodu
          </h3>
          <QRCodeCard
            url={`${siteUrl}/m/${slug}`}
            name={memory.full_name}
          />
        </section>

        {/* Ziyaretçi Defteri / Taziye Bölümü */}
        <section className="mt-10">
          <div className="flex items-center justify-between px-2 mb-4">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Ziyaretçi Defteri
            </h3>
            <span className="text-xs font-medium text-stone-500">
              {memoryList.length} Paylaşım
            </span>
          </div>

          {/* Guestbook Formu bağlandı */}
          <GuestbookForm memorialId={memory.id} slug={slug} />

          {/* Mesaj Listesi */}
          <div className="mt-6 space-y-3">
            {memoryList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
                Henüz taziye mesajı bırakılmamış. İlk hatırayı siz paylaşın.
              </div>
            ) : (
              memoryList.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm transition"
                >
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-medium text-stone-700">
                      {note.author_name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>
                        {new Date(note.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>

                      {/* Sayfa sahibi giriş yapmışsa silme butonu */}
                      {isOwner && (
                        <form action={deleteMemory}>
                          <input type="hidden" name="memoryId" value={note.id} />
                          <input type="hidden" name="slug" value={slug} />
                          <button
                            type="submit"
                            title="Mesajı Kaldır"
                            className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                  <p className="mt-2.5 text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                    {note.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Alt Bilgi */}
        <footer className="mt-14 text-center text-xs text-stone-400">
          <p>ANIKOD ile sevgi ve saygıyla oluşturuldu.</p>
        </footer>
      </main>
    </div>
  );
}