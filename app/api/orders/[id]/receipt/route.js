import { NextResponse } from "next/server";
import { getReceiptObject } from "@/lib/receiptUpload";
import { getOrders } from "@/lib/store";

export async function GET(_request, { params }) {
  const { id } = await params;
  const orders = await getOrders();
  const order = orders.find((item) => item.id === id);
  if (!order?.receiptImage) {
    return NextResponse.json({ error: "missing" }, { status: 404 });
  }
  const object = await getReceiptObject(order.receiptImage);
  if (!object?.Body) {
    return NextResponse.json({ error: "missing" }, { status: 404 });
  }
  return new NextResponse(object.Body.transformToWebStream(), {
    headers: {
      "Content-Type": object.ContentType || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
