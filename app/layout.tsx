import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ANIKOD",
  description: "Anı Kodlama ve Yönetim Platformu",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("anikod-theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema class'ını ilk boyamadan önce uygulamak için — flaş/titreme (FOUC) önler */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-stone-950 dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}