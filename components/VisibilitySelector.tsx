"use client";

import { useState } from "react";
import type { MemorialVisibility } from "@/types/database.types";

const OPTIONS: {
  value: MemorialVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: "public",
    label: "Herkese Açık",
    description: "Bağlantıyı veya QR kodu bilen herkes görüntüleyebilir.",
  },
  {
    value: "family_only",
    label: "Sadece Aile",
    description: "Sadece siz ve davet ettiğiniz aile üyeleri görüntüleyebilir.",
  },
  {
    value: "private",
    label: "Tamamen Gizli",
    description: "Sadece siz görüntüleyebilirsiniz.",
  },
];

export default function VisibilitySelector({
  defaultValue = "public",
  disabled,
}: {
  defaultValue?: MemorialVisibility;
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<MemorialVisibility>(defaultValue);

  return (
    <div>
      <input type="hidden" name="visibility" value={selected} />
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
        Gizlilik Seviyesi
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-xs transition-colors ${
              selected === option.value
                ? "border-stone-500 bg-stone-50"
                : "border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility_radio_ui" // Çakışmayı önlemek için arayüz ismi ayrıldı
                value={option.value}
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                disabled={disabled}
                className="accent-stone-900"
              />
              <span className="font-semibold text-stone-800">{option.label}</span>
            </span>
            <span className="text-stone-500">{option.description}</span>
          </label>
        ))}
      </div>
    </div>
  );
}