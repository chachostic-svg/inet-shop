"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { useI18n } from "./I18nProvider";
import PartGlyph from "./PartGlyph";

export default function ProductCard({ product }) {
  const { t, locale } = useI18n();
  return (
    <Link
      href={`/product/${product.id}`}
      className="flex flex-col border border-line bg-panel p-4 transition hover:border-copper"
    >
      <PartGlyph type={product.type} color={product.color} className="mb-4 h-20 w-20" />
      <p className="text-xs text-muted">{t(`types.${product.type}`)}</p>
      <h2 className="mt-1 font-medium">
        {product.brand} {product.name}
      </h2>
      <p className="mt-auto pt-4 display text-lg">{formatPrice(product.price, locale)}</p>
      <p className={`mt-1 text-xs ${product.stock > 0 ? "text-signal" : "text-danger"}`}>
        {product.stock > 0 ? t("catalog.inStock") : t("catalog.out")}
      </p>
    </Link>
  );
}
