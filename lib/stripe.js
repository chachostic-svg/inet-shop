import Stripe from "stripe";

let client;

export function stripeCurrency() {
  return String(process.env.STRIPE_CURRENCY || "uzs").toLowerCase();
}

export function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const error = new Error("stripe_not_configured");
    error.code = "stripe_not_configured";
    throw error;
  }
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export function lineItemsFromOrder(order) {
  const currency = stripeCurrency();
  return order.items.map((item) => ({
    quantity: item.qty,
    price_data: {
      currency,
      unit_amount: Math.round(Number(item.price) * 100),
      product_data: {
        name: String(item.name).slice(0, 250),
      },
    },
  }));
}

export function orderOrigin(request) {
  const origin = request.headers?.get?.("origin");
  if (origin) return origin;
  if (request.nextUrl?.origin) return request.nextUrl.origin;
  try {
    return new URL(request.url).origin;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}

export async function createCheckoutSession(order, origin) {
  return getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItemsFromOrder(order),
    success_url: `${origin}/order/${encodeURIComponent(order.id)}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order/${encodeURIComponent(order.id)}`,
    client_reference_id: order.id,
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
  });
}

export async function retrieveSession(sessionId) {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(body, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    const error = new Error("stripe_webhook_not_configured");
    error.code = "stripe_webhook_not_configured";
    throw error;
  }
  if (!signature) {
    const error = new Error("stripe_signature_missing");
    error.code = "stripe_signature_missing";
    throw error;
  }
  return getStripe().webhooks.constructEvent(body, signature, secret);
}
