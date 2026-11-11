import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrders, saveOrders } from "@/lib/store";
import { editReceipt } from "@/lib/telegram";

export async function PATCH(request) {
  if (!(await getSession())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { id, status } = await request.json();
  if (!["pending", "paid", "rejected"].includes(status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const orders = await getOrders();
  const order = orders.find((item) => item.id === id);
  if (!order) return NextResponse.json({ error: "missing" }, { status: 404 });
  order.status = status;
  await saveOrders(orders);
  await editReceipt(order);
  return NextResponse.json({ orders: [...orders].reverse() });
}
