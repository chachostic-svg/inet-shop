import { NextResponse } from "next/server";
import { createCheckoutSession, isStripeEnabled, orderOrigin } from "@/lib/stripe";
import { getOrders, saveOrders } from "@/lib/store";

export async function POST(request) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 400 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const orders = await getOrders();
  const order = orders.find((item) => item.id === id);
  if (!order) return NextResponse.json({ error: "missing" }, { status: 404 });
  if (order.status !== "pending") {
    return NextResponse.json({ error: "closed" }, { status: 400 });
  }

  try {
    const origin = orderOrigin(request);
    const session = await createCheckoutSession(order, origin);
    order.stripeSessionId = session.id;
    order.paymentMethod = "stripe";
    await saveOrders(orders);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json({ error: err.message || "stripe_error" }, { status: 500 });
  }
}
