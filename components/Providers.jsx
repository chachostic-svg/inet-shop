"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider } from "./I18nProvider";
import { ShopProvider } from "./ShopProvider";

export default function Providers({ locale, children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <I18nProvider locale={locale}>
        <ShopProvider>{children}</ShopProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
