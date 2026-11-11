"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, interpolate } from "@/lib/i18n";

const I18nContext = createContext(null);

export function I18nProvider({ locale: initialLocale, children }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale === "uz" ? "uz" : "ru");
  const dict = useMemo(() => getDict(locale), [locale]);

  const t = (path, vars) => {
    const value = path.split(".").reduce((acc, key) => acc?.[key], dict);
    if (typeof value !== "string") return path;
    return vars ? interpolate(value, vars) : value;
  };

  const setLocale = async (next) => {
    const value = next === "uz" ? "uz" : "ru";
    setLocaleState(value);
    document.documentElement.lang = value;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: value }),
    });
    router.refresh();
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n");
  return ctx;
}
