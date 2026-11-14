import { NextResponse } from "next/server";
import { constructWebhookEvent, isStripeEnabled } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/store";
import { sendReceipt } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const PAID_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

export async function POST(request) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 400 });
  }
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch {
    return NextResponse.json({ error: "signature" }, { status: 400 });
  }

  if (PAID_EVENTS.has(event.type)) {
    const session = event.data.object;
    const id = session.metadata?.order_id || session.client_reference_id;
      if (id) {
        const order = await markOrderPaid(id, session.payment_intent || session.id);
        if (order) {
          try {
            await sendReceipt(order, null);
          } catch {
            // webhook must still return 200; Telegram is best-effort
          }
        }
      }
  }

  return NextResponse.json({ received: true });
}
