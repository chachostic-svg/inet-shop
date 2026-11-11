"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { useShop } from "./ShopProvider";

export default function ProductActions({ product }) {
  const { t } = useI18n();
  const { addToCart, setSlot } = useShop();
  const router = useRouter();
  const [note, setNote] = useState("");

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={product.stock < 1}
        className="bg-copper px-4 py-2 text-white disabled:opacity-40"
        onClick={() => {
          addToCart(product.id);
          setNote(t("product.added"));
        }}
      >
        {t("product.addCart")}
      </button>
      <button
        type="button"
        className="border border-line px-4 py-2"
        onClick={() => {
          setSlot(product.type, product.id);
          router.push("/builder");
        }}
      >
        {t("product.addBuild")}
      </button>
      {note && <span className="self-center text-sm text-signal">{note}</span>}
    </div>
  );
}
