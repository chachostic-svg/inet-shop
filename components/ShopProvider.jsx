"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { EMPTY_BUILD } from "@/lib/types";

const ShopContext = createContext(null);
const CART_KEY = "plate-cart";
const BUILD_KEY = "plate-build";

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [slots, setSlots] = useState(EMPTY_BUILD);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(loadJson(CART_KEY, []));
    setSlots({ ...EMPTY_BUILD, ...loadJson(BUILD_KEY, {}) });
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(BUILD_KEY, JSON.stringify(slots));
  }, [slots, ready]);

  const api = useMemo(
    () => ({
      cart,
      slots,
      addToCart(id) {
        setCart((prev) => {
          const found = prev.find((row) => row.id === id);
          if (found) {
            return prev.map((row) =>
              row.id === id ? { ...row, qty: row.qty + 1 } : row
            );
          }
          return [...prev, { id, qty: 1 }];
        });
      },
      setQty(id, qty) {
        setCart((prev) =>
          qty < 1 ? prev.filter((row) => row.id !== id) : prev.map((row) => (row.id === id ? { ...row, qty } : row))
        );
      },
      removeFromCart(id) {
        setCart((prev) => prev.filter((row) => row.id !== id));
      },
      clearCart() {
        setCart([]);
      },
      setSlot(type, id) {
        setSlots((prev) => ({ ...prev, [type]: id }));
      },
      clearSlot(type) {
        setSlots((prev) => ({ ...prev, [type]: null }));
      },
      cartCount: cart.reduce((sum, row) => sum + row.qty, 0),
    }),
    [cart, slots]
  );

  return <ShopContext.Provider value={api}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop");
  return ctx;
}
