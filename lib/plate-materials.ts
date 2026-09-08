export type PlateMaterial = "stainless_steel" | "marble_finish" | "matte_black" | "classic_gold";

export const PLATE_MATERIALS: PlateMaterial[] = [
  "stainless_steel",
  "marble_finish",
  "matte_black",
  "classic_gold",
];

export const PLATE_MATERIAL_INFO: Record<
  PlateMaterial,
  { label: string; description: string; previewClassName: string; textClassName: string }
> = {
  stainless_steel: {
    label: "Paslanmaz Çelik",
    description: "Parlak, hava koşullarına dayanıklı klasik seçim.",
    previewClassName: "bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500",
    textClassName: "text-slate-900",
  },
  marble_finish: {
    label: "Mermer Uyumlu",
    description: "Damarlı, zarif mermer dokusu görünümü.",
    previewClassName: "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-400",
    textClassName: "text-stone-900",
  },
  matte_black: {
    label: "Siyah Mat",
    description: "Modern, sade ve göz alıcı mat siyah yüzey.",
    previewClassName: "bg-gradient-to-br from-neutral-700 via-neutral-800 to-black",
    textClassName: "text-white",
  },
  classic_gold: {
    label: "Altın Kaplama",
    description: "Sıcak, prestijli altın tonlu kaplama.",
    previewClassName: "bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600",
    textClassName: "text-amber-950",
  },
};
