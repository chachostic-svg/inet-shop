"use client";

import { useI18n } from "./I18nProvider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-line py-8 text-center text-sm text-muted">
      {t("footer")}
    </footer>
  );
}
