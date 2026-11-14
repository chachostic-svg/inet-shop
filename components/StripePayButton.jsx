"use client";

import { useState } from "react";
import { useI18n } from "./I18nProvider";

export default function StripePayButton({ orderId, total }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onPay() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(t("checkout.stripeError"));
    } catch {
      setError(t("checkout.stripeError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      <h2 className="display text-xl">{t("order.payNow")}</h2>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="button"
        onClick={onPay}
        disabled={busy}
        className="bg-copper px-4 py-2 text-white disabled:opacity-40"
      >
        {busy ? t("checkout.sending") : t("order.stripePay")}
      </button>
    </div>
  );
}
