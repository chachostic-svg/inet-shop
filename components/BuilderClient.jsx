"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SLOT_ORDER } from "@/lib/types";
import { buildFromSlots, checkCompat, estimatedPower, isBuildComplete } from "@/lib/compat";
import { formatPrice } from "@/lib/money";
import { useI18n } from "./I18nProvider";
import { useShop } from "./ShopProvider";
import IsometricRig from "./IsometricRig";
import PartGlyph from "./PartGlyph";
import FpsTable from "./FpsTable";

const PcScene = dynamic(() => import("./PcScene"), { ssr: false });

export default function BuilderClient({ products, games }) {
  const { t, locale } = useI18n();
  const { slots, setSlot, clearSlot } = useShop();
  const [view, setView] = useState("iso");
  const [assembled, setAssembled] = useState(false);
  const [openSlot, setOpenSlot] = useState("cpu");

  const parts = useMemo(() => buildFromSlots(products, slots), [products, slots]);
  const issues = useMemo(() => checkCompat(parts), [parts]);
  const complete = isBuildComplete(slots);
  const power = estimatedPower(parts);
  const total = SLOT_ORDER.reduce((sum, slot) => sum + (parts[slot]?.price || 0), 0);
  const options = products.filter((item) => item.type === openSlot && item.stock > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="display text-3xl">{t("builder.title")}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t("builder.lead")}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={`border px-3 py-2 ${view === "iso" ? "border-copper bg-copper text-white" : "border-line"}`}
          onClick={() => setView("iso")}
        >
          {t("builder.viewIso")}
        </button>
        <button
          type="button"
          className={`border px-3 py-2 ${view === "3d" ? "border-copper bg-copper text-white" : "border-line"}`}
          onClick={() => setView("3d")}
        >
          {t("builder.view3d")}
        </button>
        <button
          type="button"
          className="border border-line px-3 py-2"
          onClick={() => setAssembled((value) => !value)}
        >
          {assembled ? t("builder.exploded") : t("builder.assembled")}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border border-line">
          {view === "iso" ? (
            <IsometricRig parts={parts} assembled={assembled} />
          ) : (
            <>
              <PcScene parts={parts} assembled={assembled} />
              <p className="border-t border-line bg-panel px-3 py-2 text-xs text-muted">
                {t("builder.rotate")}
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          {SLOT_ORDER.map((slot) => {
            const part = parts[slot];
            return (
              <div
                key={slot}
                className={`flex w-full items-center gap-3 border p-3 text-left ${
                  openSlot === slot ? "border-copper" : "border-line bg-panel"
                }`}
              >
                <button type="button" className="flex flex-1 items-center gap-3 text-left" onClick={() => setOpenSlot(slot)}>
                  <PartGlyph type={slot} color={part?.color || "#8a93a0"} className="h-10 w-10 shrink-0" />
                  <span className="flex-1">
                    <span className="block text-xs text-muted">{t(`types.${slot}`)}</span>
                    <span className="block text-sm">
                      {part ? `${part.brand} ${part.name}` : t("builder.empty")}
                    </span>
                  </span>
                </button>
                {part && (
                  <button type="button" className="text-xs text-muted" onClick={() => clearSlot(slot)}>
                    {t("builder.clear")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border border-line bg-panel p-4">
        <h2 className="mb-3 text-sm text-muted">
          {t("builder.choose")} · {t(`types.${openSlot}`)}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSlot(openSlot, item.id)}
              className={`border p-3 text-left ${
                slots[openSlot] === item.id ? "border-copper" : "border-line"
              }`}
            >
              <span className="block font-medium">
                {item.brand} {item.name}
              </span>
              <span className="text-sm text-muted">{formatPrice(item.price, locale)}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-panel p-4">
          <h2 className="display text-xl">{t("builder.issues")}</h2>
          {issues.length === 0 ? (
            <p className="mt-3 text-signal">{t("builder.ok")}</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-danger">
              {issues.map((issue) => (
                <li key={issue.key}>{t(issue.key, issue.vars)}</li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-muted">
            {t("builder.power")}: {power} {t("builder.watts")}
          </p>
          <p className="display mt-2 text-2xl">{formatPrice(total, locale)}</p>
          {complete && issues.length === 0 ? (
            <Link
              href="/checkout?from=build"
              className="mt-4 inline-block bg-copper px-4 py-2 text-white"
            >
              {t("builder.buyBuild")}
            </Link>
          ) : (
            <p className="mt-4 text-sm text-muted">{t("builder.needParts")}</p>
          )}
        </div>
        <FpsTable games={games} parts={parts} />
      </section>
    </div>
  );
}
