export const PAYMENT_METHODS = ["payme", "click", "card", "stripe"];

export function getPaymentRequisites() {
  return {
    card: String(process.env.PAYMENT_CARD || "").replace(/\s/g, ""),
    phone: String(process.env.PAYMENT_PHONE || "").trim(),
  };
}

export function formatCard(card) {
  const digits = String(card || "").replace(/\D/g, "");
  return digits.replace(/(\d{4})/g, "$1 ").trim();
}
