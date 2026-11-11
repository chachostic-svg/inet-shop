"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/money";
import { useI18n } from "./I18nProvider";

export default function AdminClient({ initialProducts, initialGames, initialOrders }) {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState(initialProducts);
  const [games, setGames] = useState(initialGames);
  const [orders, setOrders] = useState(initialOrders);
  const [note, setNote] = useState("");
  const [gameForm, setGameForm] = useState({
    name: "",
    cpuDemand: 1,
    low: 80,
    medium: 60,
    high: 45,
    ultra: 30,
  });

  const totals = useMemo(
    () => ({
      pending: orders.filter((item) => item.status === "pending").length,
    }),
    [orders]
  );

  async function saveProduct(product) {
    const res = await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      const next = await res.json();
      setProducts(next.products);
      setNote(t("panel.saved"));
    }
  }

  async function addGame(event) {
    event.preventDefault();
    const res = await fetch("/api/admin/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: gameForm.name,
        cpuDemand: Number(gameForm.cpuDemand),
        base: {
          low: Number(gameForm.low),
          medium: Number(gameForm.medium),
          high: Number(gameForm.high),
          ultra: Number(gameForm.ultra),
        },
      }),
    });
    if (res.ok) {
      const next = await res.json();
      setGames(next.games);
      setNote(t("panel.saved"));
      setGameForm({ name: "", cpuDemand: 1, low: 80, medium: 60, high: 45, ultra: 30 });
    }
  }

  async function setStatus(id, status) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const next = await res.json();
      setOrders(next.orders);
      setNote(t("panel.saved"));
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl">{t("panel.title")}</h1>
        <button type="button" className="border border-line px-3 py-1.5" onClick={logout}>
          {t("panel.logout")}
        </button>
      </div>
      <div className="mt-6 flex gap-2">
        {["products", "games", "orders"].map((id) => (
          <button
            key={id}
            type="button"
            className={`border px-3 py-1.5 ${tab === id ? "border-copper bg-copper text-white" : "border-line"}`}
            onClick={() => setTab(id)}
          >
            {t(`panel.${id}`)}
            {id === "orders" && totals.pending ? ` (${totals.pending})` : ""}
          </button>
        ))}
      </div>
      {note && <p className="mt-3 text-sm text-signal">{note}</p>}

      {tab === "products" && (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-plate">
              <tr>
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">{t("product.specs")}</th>
                <th className="px-2 py-2">{t("cart.total")}</th>
                <th className="px-2 py-2">Stock</th>
                <th className="px-2 py-2">Socket</th>
                <th className="px-2 py-2">TDP</th>
                <th className="px-2 py-2">FPS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  locale={locale}
                  onSave={saveProduct}
                  saveLabel={t("panel.save")}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "games" && (
        <div className="mt-6 space-y-6">
          <form onSubmit={addGame} className="grid gap-3 border border-line bg-panel p-4 sm:grid-cols-6">
            <input
              required
              placeholder={t("panel.gameName")}
              value={gameForm.name}
              onChange={(event) => setGameForm({ ...gameForm, name: event.target.value })}
              className="border border-line bg-bg px-2 py-2 sm:col-span-2"
            />
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="2"
              value={gameForm.cpuDemand}
              onChange={(event) => setGameForm({ ...gameForm, cpuDemand: event.target.value })}
              className="border border-line bg-bg px-2 py-2"
            />
            {["low", "medium", "high", "ultra"].map((preset) => (
              <input
                key={preset}
                type="number"
                min="1"
                value={gameForm[preset]}
                onChange={(event) => setGameForm({ ...gameForm, [preset]: event.target.value })}
                className="border border-line bg-bg px-2 py-2"
                placeholder={preset}
              />
            ))}
            <button type="submit" className="bg-copper px-3 py-2 text-white sm:col-span-6">
              {t("panel.addGame")}
            </button>
          </form>
          <ul className="divide-y divide-line border border-line bg-panel">
            {games.map((game) => (
              <li key={game.id} className="px-4 py-3 text-sm">
                <span className="font-medium">{game.name}</span>
                <span className="ml-3 text-muted">
                  CPU {game.cpuDemand} · {game.base.low}/{game.base.medium}/{game.base.high}/{game.base.ultra}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "orders" && (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="border border-line bg-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="display text-lg">{order.id}</p>
                <p className="text-sm text-muted">
                  {t(`order.${order.status}`)} · {formatPrice(order.total, locale)}
                </p>
              </div>
              <p className="mt-1 text-sm">
                {order.name} · {order.phone} · {order.city}
              </p>
              {order.paymentMethod && (
                <p className="mt-1 text-sm text-muted">
                  {t(`checkout.${order.paymentMethod}`)} · {order.paymentRef || "—"}
                </p>
              )}
              {order.receiptImage && (
                <img
                  src={`/api/orders/${order.id}/receipt`}
                  alt=""
                  className="mt-3 max-h-40 border border-line object-contain"
                />
              )}
              <ul className="mt-2 text-sm text-muted">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.id}`}>
                    {item.name} × {item.qty}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <button type="button" className="border border-line px-3 py-1" onClick={() => setStatus(order.id, "paid")}>
                  {t("order.paid")}
                </button>
                <button
                  type="button"
                  className="border border-line px-3 py-1"
                  onClick={() => setStatus(order.id, "rejected")}
                >
                  {t("order.rejected")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductRow({ product, locale, onSave, saveLabel }) {
  const [draft, setDraft] = useState(product);
  return (
    <tr className="border-t border-line">
      <td className="px-2 py-2 align-top text-xs">{product.id}</td>
      <td className="px-2 py-2 align-top">
        {product.brand} {product.name}
        <div className="text-xs text-muted">{formatPrice(draft.price, locale)}</div>
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={draft.price}
          onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
          className="w-28 border border-line bg-bg px-1 py-1"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={draft.stock}
          onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })}
          className="w-16 border border-line bg-bg px-1 py-1"
        />
      </td>
      <td className="px-2 py-2">
        <input
          value={draft.socket || ""}
          onChange={(event) => setDraft({ ...draft, socket: event.target.value })}
          className="w-24 border border-line bg-bg px-1 py-1"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={draft.tdp || ""}
          onChange={(event) => setDraft({ ...draft, tdp: Number(event.target.value) })}
          className="w-16 border border-line bg-bg px-1 py-1"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={draft.fpsScore || ""}
          onChange={(event) => setDraft({ ...draft, fpsScore: Number(event.target.value) })}
          className="w-16 border border-line bg-bg px-1 py-1"
        />
      </td>
      <td className="px-2 py-2">
        <button type="button" className="bg-copper px-2 py-1 text-white" onClick={() => onSave(draft)}>
          {saveLabel}
        </button>
      </td>
    </tr>
  );
}
