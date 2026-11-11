"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { useI18n } from "./I18nProvider";
import { useShop } from "./ShopProvider";
import PartGlyph from "./PartGlyph";

export default function CartClient({ products }) {
  const { t, locale } = useI18n();
  const { cart, setQty, removeFromCart } = useShop();
  const rows = cart
    .map((row) => ({ ...row, product: products.find((item) => item.id === row.id) }))
    .filter((row) => row.product);
  const total = rows.reduce((sum, row) => sum + row.product.price * row.qty, 0);

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="display text-3xl">{t("cart.title")}</h1>
        <p className="mt-4 text-muted">{t("cart.empty")}</p>
        <Link href="/" className="mt-6 inline-block border border-line px-4 py-2">
          {t("nav.catalog")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="display text-3xl">{t("cart.title")}</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-4 border border-line bg-panel p-3">
            <PartGlyph type={row.product.type} color={row.product.color} className="h-12 w-12" />
            <div className="flex-1">
              <p className="font-medium">
                {row.product.brand} {row.product.name}
              </p>
              <p className="text-sm text-muted">{formatPrice(row.product.price, locale)}</p>
            </div>
            <label className="text-xs text-muted">
              {t("cart.qty")}
              <input
                type="number"
                min="1"
                value={row.qty}
                onChange={(event) => setQty(row.id, Number(event.target.value))}
                className="ml-2 w-16 border border-line bg-bg px-2 py-1 text-ink"
              />
            </label>
            <button type="button" className="text-sm text-danger" onClick={() => removeFromCart(row.id)}>
              {t("cart.remove")}
            </button>
          </li>
        ))}
      </ul>
      <p className="display mt-6 text-2xl">
        {t("cart.total")}: {formatPrice(total, locale)}
      </p>
      <Link href="/checkout?from=cart" className="mt-4 inline-block bg-copper px-4 py-2 text-white">
        {t("cart.checkout")}
      </Link>
    </div>
  );
}
