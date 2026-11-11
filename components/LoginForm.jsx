"use client";

import { useState } from "react";
import { useI18n } from "./I18nProvider";

export default function LoginForm() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError(t("panel.fail"));
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-24 max-w-sm border border-line bg-panel p-6">
      <h1 className="display text-2xl">{t("panel.login")}</h1>
      <label className="mt-4 block text-sm">
        {t("panel.password")}
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full border border-line bg-bg px-3 py-2"
        />
      </label>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <button type="submit" className="mt-4 w-full bg-copper py-2 text-white">
        {t("panel.enter")}
      </button>
    </form>
  );
}
