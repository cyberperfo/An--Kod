"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import AccountMenu from "@/components/AccountMenu";

const NAV_LINKS = [
  { href: "/dashboard", label: "Panel" },
  { href: "/dashboard/nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "/dashboard/destek", label: "Destek" },
  { href: "/dashboard/hakkimizda", label: "Hakkımızda" },
];

export default function DashboardNavbar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="shrink-0">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-white">
              ANIKOD
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                      : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/dashboard/new"
            className="hidden items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 sm:inline-flex dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
          >
            + Yeni Anı Sayfası
          </Link>
          <AccountMenu userEmail={userEmail} />
        </div>
      </div>

      {/* Mobilde alt satır navigasyon */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden dark:border-stone-800">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
