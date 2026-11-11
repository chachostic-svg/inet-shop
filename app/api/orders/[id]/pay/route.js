import { NextResponse } from "next/server";
import { readReceiptFile, saveReceiptFile } from "@/lib/receiptUpload";
import { getOrders, saveOrders } from "@/lib/store";
import { editReceipt, sendReceipt } from "@/lib/telegram";

export async function POST(request, { params }) {
  const { id } = await params;
  const form = await request.formData();
  const paymentMethod = ["payme", "click", "card"].includes(String(form.get("paymentMethod")))
    ? String(form.get("paymentMethod"))
    : "";
  const paymentRef = String(form.get("paymentRef") || "").trim();
  const receipt = await readReceiptFile(form.get("receipt"));
  if (receipt.error) {
    return NextResponse.json({ error: receipt.error }, { status: 400 });
  }
  if (!paymentMethod || paymentRef.length < 3) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const orders = await getOrders();
  const order = orders.find((item) => item.id === id);
  if (!order) return NextResponse.json({ error: "missing" }, { status: 404 });
  if (order.status !== "pending") {
    return NextResponse.json({ error: "closed" }, { status: 400 });
  }

  order.paymentMethod = paymentMethod;
  order.paymentRef = paymentRef;
  order.receiptImage = await saveReceiptFile(order.id, receipt.buffer, receipt.ext);
  await saveOrders(orders);

  const telegram = await sendReceipt(order, receipt);
  if (telegram.ok) {
    order.telegramMessageId = telegram.messageId;
    order.telegramKind = telegram.kind || "photo";
    await saveOrders(orders);
  } else if (order.telegramMessageId) {
    await editReceipt(order);
  }

  return NextResponse.json({ ok: true, id: order.id, telegram: telegram.ok });
}
