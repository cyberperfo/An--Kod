import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicMemoryPage({ params }: Props) {
  const { slug } = await params;

  // Geçici sahte veri (UI testi için)
  const memory = {
    fullName: "Mehmet Özkan",
    birthYear: "1954",
    deathYear: "2023",
    bio: "Ömrünü ailesine, eğitime ve insan yetiştirmeye adamış; hayatı boyunca dürüstlüğü ve sevgiyi rehber edinmiş kıymetli bir öğretmen, baba ve dede. Bıraktığı güzel hatıralar kalbimizde daima yaşayacak.",
    notes: [
      {
        id: 1,
        author: "Ahmet Yılmaz",
        date: "12 Ekim 2024",
        message: "Hocamın üzerimizdeki emeği çok büyüktü. Mekanı cennet olsun.",
      },
      {
        id: 2,
        author: "Zeynep Kaya",
        date: "15 Ekim 2024",
        message: "Her zaman güler yüzü ve öğütleriyle hatırlayacağız. Başınız sağ olsun.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 antialiased selection:bg-stone-200">
      {/* Üst Zarif Başlık */}
      <header className="border-b border-stone-200/80 bg-white/70 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4">
          <span className="font-serif text-sm tracking-widest text-stone-500 uppercase">
            ANIKOD HATIRA SAYFASI
          </span>
          <span className="text-xs text-stone-400">/{slug}</span>
        </div>
      </header>

      {/* Profil ve Bilgiler */}
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm">
          {/* Fotoğraf Alanı */}
          <div className="flex flex-col items-center border-b border-stone-100 px-6 pt-10 pb-8 text-center">
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-stone-100 shadow-md">
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
            </div>

            <h1 className="mt-5 font-serif text-3xl font-bold tracking-tight text-stone-900">
              {memory.fullName}
            </h1>
            <p className="mt-1 font-serif text-sm tracking-widest text-stone-500">
              {memory.birthYear} — {memory.deathYear}
            </p>
          </div>

          {/* Biyografi ve Anılar */}
          <div className="px-6 py-8 sm:px-10">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              Hatırası ve Hayatı
            </h2>
            <p className="mt-3 leading-relaxed text-stone-600">
              {memory.bio}
            </p>
          </div>
        </div>

        {/* Ziyaretçi Defteri / Taziye Bölümü */}
        <section className="mt-10">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Ziyaretçi Defteri
            </h3>
            <span className="text-xs font-medium text-stone-500">
              {memory.notes.length} Paylaşım
            </span>
          </div>

          {/* Not Bırakma Kutusu */}
          <div className="mt-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-stone-800">
              Bir Anı veya Taziye Mesajı Bırakın
            </h4>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-sm text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:outline-none"
              />
              <textarea
                rows={3}
                placeholder="Paylaşmak istediğiniz duygularınız veya hatıranız..."
                className="w-full resize-none rounded-xl border border-stone-200 p-3.5 text-sm text-stone-800 placeholder-stone-400 focus:border-stone-400 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
                >
                  Mesajı İlet
                </button>
              </div>
            </div>
          </div>

          {/* Mesaj Listesi */}
          <div className="mt-6 space-y-3">
            {memory.notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-medium text-stone-700">{note.author}</span>
                  <span>{note.date}</span>
                </div>
                <p className="mt-2.5 text-sm text-stone-600 leading-relaxed">
                  {note.message}
                </p>
              </div>
            ))}
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