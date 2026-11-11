"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/money";
import { formatCard } from "@/lib/payment";
import { useI18n } from "./I18nProvider";

const METHODS = ["payme", "click", "card"];

export default function PaymentFields({
  total,
  requisites,
  method,
  onMethod,
  paymentRef,
  onPaymentRef,
  receiptFile,
  onReceiptFile,
}) {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState("");
  const [preview, setPreview] = useState("");
  const card = formatCard(requisites.card);
  const phone = requisites.phone;

  useEffect(() => {
    if (!receiptFile) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(receiptFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  async function copy(value, key) {
    if (!value) return;
    await navigator.clipboard.writeText(value.replace(/\s/g, ""));
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <fieldset className="space-y-4 border border-line bg-panel p-4">
      <legend className="display px-1 text-lg">{t("checkout.payTitle")}</legend>
      <p className="display text-2xl">
        {t("checkout.payAmount")}: {formatPrice(total, locale)}
      </p>
      <p className="text-sm text-muted">{t("checkout.payMethod")}</p>
      <div className="flex flex-wrap gap-2">
        {METHODS.map((id) => (
          <label
            key={id}
            className={`cursor-pointer border px-3 py-2 text-sm ${
              method === id ? "border-copper bg-copper text-white" : "border-line"
            }`}
          >
            <input
              type="radio"
              name="pay-method"
              value={id}
              checked={method === id}
              onChange={() => onMethod(id)}
              className="sr-only"
            />
            {t(`checkout.${id}`)}
          </label>
        ))}
      </div>
      {card ? (
        <div>
          <p className="text-sm text-muted">{t("checkout.payCard")}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="display flex-1 border border-line px-3 py-2 tracking-wide">{card}</p>
            <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => copy(card, "card")}>
              {copied === "card" ? t("checkout.copied") : t("checkout.copy")}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-danger">{t("checkout.noRequisites")}</p>
      )}
      {phone && (
        <div>
          <p className="text-sm text-muted">{t("checkout.payPhone")}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="flex-1 border border-line px-3 py-2">{phone}</p>
            <button type="button" className="border border-line px-3 py-2 text-sm" onClick={() => copy(phone, "phone")}>
              {copied === "phone" ? t("checkout.copied") : t("checkout.copy")}
            </button>
          </div>
        </div>
      )}
      <label className="block text-sm">
        {t("checkout.payRef")}
        <input
          required
          minLength={3}
          value={paymentRef}
          onChange={(event) => onPaymentRef(event.target.value)}
          placeholder="123456 или 9012"
          className="mt-1 w-full border border-line bg-bg px-3 py-2"
        />
        <span className="mt-1 block text-xs text-muted">{t("checkout.payRefHint")}</span>
      </label>
      <label className="block text-sm">
        {t("checkout.receiptPhoto")}
        <input
          required
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          capture="environment"
          onChange={(event) => onReceiptFile(event.target.files?.[0] || null)}
          className="mt-1 w-full border border-line bg-bg px-3 py-2"
        />
        <span className="mt-1 block text-xs text-muted">{t("checkout.receiptHint")}</span>
      </label>
      {preview && (
        <img src={preview} alt="" className="max-h-48 w-full border border-line object-contain" />
      )}
    </fieldset>
  );
}
