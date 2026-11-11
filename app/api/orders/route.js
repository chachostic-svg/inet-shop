import { NextResponse } from "next/server";
import { readReceiptFile, saveReceiptFile } from "@/lib/receiptUpload";
import { getOrders, getProducts, saveOrders, saveProducts } from "@/lib/store";
import { sendReceipt } from "@/lib/telegram";

function nextId(orders) {
  const year = new Date().getFullYear();
  const prefix = `PC-${year}-`;
  const nums = orders
    .map((order) => Number(String(order.id).replace(prefix, "")))
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

function parseItems(raw) {
  try {
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function POST(request) {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const city = String(form.get("city") || "").trim();
  const items = parseItems(form.get("items"));
  const paymentMethod = ["payme", "click", "card"].includes(String(form.get("paymentMethod")))
    ? String(form.get("paymentMethod"))
    : "";
  const paymentRef = String(form.get("paymentRef") || "").trim();
  let build = null;
  try {
    build = JSON.parse(String(form.get("build") || "null"));
  } catch {
    build = null;
  }

  const receipt = await readReceiptFile(form.get("receipt"));
  if (receipt.error) {
    return NextResponse.json({ error: receipt.error }, { status: 400 });
  }

  if (!name || !city || !/^\+998[0-9]{9}$/.test(phone) || items.length === 0 || !paymentMethod || paymentRef.length < 3) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const products = await getProducts();
  const byId = Object.fromEntries(products.map((item) => [item.id, item]));
  const normalized = [];

  for (const row of items) {
    const product = byId[row.id];
    const qty = Math.max(1, Number(row.qty) || 1);
    if (!product) return NextResponse.json({ error: "unknown_item" }, { status: 400 });
    if (product.stock < qty) return NextResponse.json({ error: "stock" }, { status: 400 });
    normalized.push({
      id: product.id,
      name: `${product.brand} ${product.name}`,
      qty,
      price: product.price,
      type: product.type,
    });
    product.stock -= qty;
  }

  const order = {
    id: nextId(await getOrders()),
    createdAt: new Date().toISOString(),
    name,
    phone,
    city,
    items: normalized,
    build,
    total: normalized.reduce((sum, item) => sum + item.price * item.qty, 0),
    status: "pending",
    paymentMethod,
    paymentRef,
    receiptImage: null,
    telegramMessageId: null,
    telegramKind: "text",
  };

  order.receiptImage = await saveReceiptFile(order.id, receipt.buffer, receipt.ext);

  const orders = await getOrders();
  orders.push(order);
  await saveProducts(products);
  await saveOrders(orders);

  const telegram = await sendReceipt(order, receipt);
  if (telegram.ok) {
    order.telegramMessageId = telegram.messageId;
    order.telegramKind = telegram.kind || "text";
    await saveOrders(orders);
    return NextResponse.json({ id: order.id, telegram: true });
  }

  return NextResponse.json({ id: order.id, telegram: false, error: telegram.error });
}
