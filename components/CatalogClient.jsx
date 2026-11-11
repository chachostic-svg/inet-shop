"use client";

import { useMemo, useState } from "react";
import { SLOT_ORDER } from "@/lib/types";
import { useI18n } from "./I18nProvider";
import ProductCard from "./ProductCard";

export default function CatalogClient({ products }) {
  const { t } = useI18n();
  const [type, setType] = useState("all");
  const list = useMemo(
    () => (type === "all" ? products : products.filter((item) => item.type === type)),
    [products, type]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display text-3xl">{t("catalog.title")}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t("catalog.lead")}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={`border px-3 py-1.5 text-sm ${type === "all" ? "border-copper bg-copper text-white" : "border-line"}`}
          onClick={() => setType("all")}
        >
          {t("catalog.all")}
        </button>
        {SLOT_ORDER.map((slot) => (
          <button
            key={slot}
            type="button"
            className={`border px-3 py-1.5 text-sm ${type === slot ? "border-copper bg-copper text-white" : "border-line"}`}
            onClick={() => setType(slot)}
          >
            {t(`types.${slot}`)}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="mt-10 text-muted">{t("catalog.empty")}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
