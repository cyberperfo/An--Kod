import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import * as QRCode from "qrcode";
import Link from "next/link";
import PrintButton from "./PrintButton";

interface PrintPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function PrintTemplatePage(props: PrintPageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const slug = resolvedParams.slug;

  const supabase = await createClient();

  const { data: memorial } = await (supabase.from("memorials") as any)
    .select("*")
    .eq("slug", slug)
    .single();

  if (!memorial) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const targetUrl = `${siteUrl}/m/${memorial.slug}`;

  // Lazer kazıma ve baskı için yüksek kaliteli QR SVG
  let qrSvg = "";
  try {
    qrSvg = await QRCode.toString(targetUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR oluşturma hatası:", err);
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6 text-stone-900 print:bg-white print:p-0">
      {/* Yazdırma Esnasında Gizlenen Kontrol Çubuğu */}
      <div className="mx-auto mb-8 flex max-w-xl items-center justify-between print:hidden">
        <Link
          href="/queue"
          className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
        >
          ← Kuyruğa Dön
        </Link>
        <PrintButton />
      </div>

      {/* Lazer / Plaket Baskı Şablonu (Fiziksel Boyut: ~10cm x 7cm Standart Plaka) */}
      <div className="mx-auto flex aspect-[10/7] max-w-xl flex-col items-center justify-between rounded-2xl border-2 border-stone-900 bg-white p-8 shadow-md print:m-0 print:h-[70mm] print:w-[100mm] print:border-2 print:border-black print:p-6 print:shadow-none">
        {/* Plaka Üst Başlık */}
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-stone-400 uppercase print:text-black">
            ANIKOD DİJİTAL ANIT
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-stone-900 print:text-black">
            {memorial.full_name}
          </h1>
          <p className="mt-1 font-mono text-xs text-stone-600 print:text-black">
            {memorial.birth_date || "—"} — {memorial.death_date || "—"}
          </p>
        </div>

        {/* QR Kod Alanı */}
        <div
          className="h-36 w-36 print:h-28 print:w-28 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />

        {/* Alt Bilgi */}
        <div className="text-center">
          <p className="text-[11px] font-medium text-stone-500 print:text-black">
            Hatırasını yaşatmak için kameranızla okutun
          </p>
          <p className="mt-0.5 font-mono text-[9px] text-stone-400 print:text-black">
            anikod.com/m/{memorial.slug}
          </p>
        </div>
      </div>
    </div>
  );
}