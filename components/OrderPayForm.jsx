"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "./I18nProvider";
import PaymentFields from "./PaymentFields";

export default function OrderPayForm({ orderId, total, requisites }) {
  const { t } = useI18n();
  const router = useRouter();
  const [method, setMethod] = useState("payme");
  const [paymentRef, setPaymentRef] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    if (!receiptFile) {
      setError(t("checkout.receiptNeed"));
      return;
    }
    setBusy(true);
    setError("");
    const payload = new FormData();
    payload.append("paymentMethod", method);
    payload.append("paymentRef", paymentRef);
    payload.append("receipt", receiptFile);
    const res = await fetch(`/api/orders/${orderId}/pay`, {
      method: "POST",
      body: payload,
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errors = {
        receipt_required: t("checkout.receiptNeed"),
        receipt_large: t("checkout.receiptLarge"),
        receipt_type: t("checkout.receiptType"),
      };
      setError(errors[data.error] || t("checkout.error"));
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <h2 className="display text-xl">{t("order.payNow")}</h2>
      <PaymentFields
        total={total}
        requisites={requisites}
        method={method}
        onMethod={setMethod}
        paymentRef={paymentRef}
        onPaymentRef={setPaymentRef}
        receiptFile={receiptFile}
        onReceiptFile={setReceiptFile}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={busy} className="bg-copper px-4 py-2 text-white disabled:opacity-40">
        {busy ? t("checkout.sending") : t("checkout.submit")}
      </button>
    </form>
  );
}
