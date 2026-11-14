"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { buildFromSlots, buildLineItems, checkCompat, isBuildComplete } from "@/lib/compat";
import { formatPrice } from "@/lib/money";
import { useI18n } from "./I18nProvider";
import { useShop } from "./ShopProvider";
import PaymentFields from "./PaymentFields";

export default function CheckoutForm({ products, requisites = { card: "", phone: "" }, stripeEnabled = false }) {
  const { t, locale } = useI18n();
  const { cart, slots, clearCart } = useShop();
  const params = useSearchParams();
  const router = useRouter();
  const fromBuild = params.get("from") === "build";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [city, setCity] = useState("");
  const [method, setMethod] = useState("payme");
  const isStripe = method === "stripe";
  const [paymentRef, setPaymentRef] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const items = useMemo(() => {
    if (fromBuild) return buildLineItems(products, slots);
    return cart
      .map((row) => {
        const product = products.find((item) => item.id === row.id);
        if (!product) return null;
        return {
          id: product.id,
          name: `${product.brand} ${product.name}`,
          qty: row.qty,
          price: product.price,
          type: product.type,
        };
      })
      .filter(Boolean);
  }, [fromBuild, products, slots, cart]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const parts = buildFromSlots(products, slots);
  const canBuild = fromBuild && isBuildComplete(slots) && checkCompat(parts).length === 0;
  const blocked = fromBuild && !canBuild;

  async function onSubmit(event) {
    event.preventDefault();
    if (blocked || items.length === 0) return;
    if (!isStripe && !receiptFile) {
      setError(t("checkout.receiptNeed"));
      return;
    }
    setBusy(true);
    setError("");
    const payload = new FormData();
    payload.append("name", name);
    payload.append("phone", phone);
    payload.append("city", city);
    payload.append("items", JSON.stringify(items));
    payload.append("build", JSON.stringify(fromBuild ? slots : null));
    payload.append("paymentMethod", method);
    if (!isStripe) {
      payload.append("paymentRef", paymentRef);
      payload.append("receipt", receiptFile);
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      body: payload,
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok && data.stripe) {
      const checkout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id }),
      });
      const session = await checkout.json();
      if (checkout.ok && session.url) {
        if (!fromBuild) clearCart();
        window.location.assign(session.url);
        return;
      }
      setBusy(false);
      setError(t("checkout.stripeError"));
      if (data.id) router.push(`/order/${data.id}`);
      return;
    }
    if (!res.ok) {
      const errors = {
        telegram_not_configured: t("checkout.telegramWarn"),
        receipt_required: t("checkout.receiptNeed"),
        receipt_large: t("checkout.receiptLarge"),
        receipt_type: t("checkout.receiptType"),
      };
      setError(errors[data.error] || t("checkout.error"));
      if (data.id) router.push(`/order/${data.id}`);
      return;
    }
    if (!fromBuild) clearCart();
    router.push(`/order/${data.id}${data.telegram === false ? "?tg=0" : ""}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="display text-3xl">{t("checkout.title")}</h1>
      <p className="mt-2 text-sm text-muted">
        {fromBuild ? t("checkout.sourceBuild") : t("checkout.sourceCart")}
      </p>
      <ul className="mt-6 space-y-2 border border-line bg-panel p-4 text-sm">
        {items.map((item) => (
          <li key={`${item.id}-${item.qty}`} className="flex justify-between gap-4">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{formatPrice(item.price * item.qty, locale)}</span>
          </li>
        ))}
        <li className="display flex justify-between border-t border-line pt-3 text-lg">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(total, locale)}</span>
        </li>
      </ul>
      {blocked && <p className="mt-4 text-sm text-danger">{t("builder.needParts")}</p>}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          {t("checkout.name")}
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full border border-line bg-panel px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("checkout.phone")}
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            pattern="\+998[0-9]{9}"
            className="mt-1 w-full border border-line bg-panel px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("checkout.city")}
          <input
            required
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 w-full border border-line bg-panel px-3 py-2"
          />
        </label>
        <PaymentFields
          total={total}
          requisites={requisites}
          method={method}
          onMethod={setMethod}
          paymentRef={paymentRef}
          onPaymentRef={setPaymentRef}
          receiptFile={receiptFile}
          onReceiptFile={setReceiptFile}
          stripeEnabled={stripeEnabled}
        />
        <p className="text-xs text-muted">{t("checkout.hint")}</p>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={busy || blocked || items.length === 0}
          className="bg-copper px-4 py-2 text-white disabled:opacity-40"
        >
          {busy ? t("checkout.sending") : isStripe ? t("order.stripePay") : t("checkout.submit")}
        </button>
      </form>
    </div>
  );
}
