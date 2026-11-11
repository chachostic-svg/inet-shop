"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "./I18nProvider";
import { useShop } from "./ShopProvider";

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { cartCount } = useShop();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const currentTheme = mounted ? resolvedTheme || theme : "light";

  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="display text-lg tracking-tight text-ink">
          {t("brand")}
          <span className="ml-3 hidden font-sans text-xs font-normal text-muted sm:inline">
            {t("tagline")}
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/" className="px-2 py-1 hover:text-copper">
            {t("nav.catalog")}
          </Link>
          <Link href="/builder" className="px-2 py-1 hover:text-copper">
            {t("nav.builder")}
          </Link>
          <Link href="/cart" className="relative px-2 py-1 hover:text-copper">
            {t("nav.cart")}
            {cartCount > 0 && (
              <span className="ml-1 bg-copper px-1.5 text-xs text-white">{cartCount}</span>
            )}
          </Link>
          <button
            type="button"
            className="border border-line px-2 py-1"
            onClick={() => setLocale(locale === "ru" ? "uz" : "ru")}
          >
            {locale === "ru" ? t("lang.uz") : t("lang.ru")}
          </button>
          <button
            type="button"
            className="border border-line px-2 py-1"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            aria-label={currentTheme === "dark" ? t("theme.light") : t("theme.dark")}
          >
            {currentTheme === "dark" ? "☀" : "☾"}
          </button>
        </nav>
      </div>
    </header>
  );
}
