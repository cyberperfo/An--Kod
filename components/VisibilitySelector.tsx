"use client";

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
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
        Gizlilik Seviyesi
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer flex-col gap-1 rounded-xl border border-stone-200 p-3 text-xs transition-colors hover:bg-stone-50 has-[:checked]:border-stone-500 has-[:checked]:bg-stone-50"
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="visibility"
                value={option.value}
                defaultChecked={option.value === defaultValue}
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
