"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export default function AccountMenu({ userEmail }: { userEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = userEmail?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 dark:bg-white dark:text-stone-900"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg dark:border-stone-800 dark:bg-stone-900"
        >
          {userEmail && (
            <div className="border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
              {userEmail}
            </div>
          )}
          <Link
            href="/dashboard/profil"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Profil
          </Link>
          <Link
            href="/dashboard/davetler"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Davetlerim
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
