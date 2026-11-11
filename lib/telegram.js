const API = "https://api.telegram.org";

export function receiptText(order, locale = "ru") {
  const lines = order.items
    .map((item) => `• ${item.name} × ${item.qty} — ${item.price.toLocaleString("ru-RU")}`)
    .join("\n");
  const status =
    order.status === "paid" ? "оплачен" : order.status === "rejected" ? "отклонён" : "ожидает оплаты";
  const title = locale === "uz" ? "Chek" : "Чек заказа";
  const pay =
    order.paymentMethod || order.paymentRef
      ? `Оплата: ${order.paymentMethod || "—"} · ${order.paymentRef || "без номера"}`
      : "Оплата: не указана";
  return [
    `${title} ${order.id}`,
    `${order.name} · ${order.phone} · ${order.city}`,
    lines,
    `Итого: ${order.total.toLocaleString("ru-RU")} сум`,
    pay,
    `Статус: ${status}`,
  ].join("\n");
}

function buttons(order) {
  return {
    inline_keyboard: [
      [
        { text: "Оплачен", callback_data: `paid:${order.id}` },
        { text: "Отклонён", callback_data: `rejected:${order.id}` },
      ],
    ],
  };
}

async function sendPhoto(token, chatId, order, image) {
  if (!image?.buffer) return { ok: false };
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append(
    "photo",
    new Blob([new Uint8Array(image.buffer)], { type: image.type || "image/jpeg" }),
    `${order.id}.${image.ext || "jpg"}`
  );
  form.append("caption", receiptText(order).slice(0, 1024));
  form.append("reply_markup", JSON.stringify(buttons(order)));
  const res = await fetch(`${API}/bot${token}/sendPhoto`, { method: "POST", body: form });
  const data = await res.json();
  if (!data.ok) return { ok: false, error: data.description || "telegram_error" };
  return { ok: true, messageId: data.result.message_id };
}

export async function sendReceipt(order, image) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = String(process.env.TELEGRAM_CHAT_ID || "").trim();
  if (!token || !chatId) {
    return { ok: false, error: "telegram_not_configured" };
  }

  const photo = await sendPhoto(token, chatId, order, image);
  if (photo.ok) return { ...photo, kind: "photo" };

  const res = await fetch(`${API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: receiptText(order),
      reply_markup: buttons(order),
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    return { ok: false, error: data.description || "telegram_error" };
  }
  return { ok: true, messageId: data.result.message_id, kind: "text" };
}

export async function editReceipt(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = String(process.env.TELEGRAM_CHAT_ID || "").trim();
  if (!token || !chatId || !order.telegramMessageId) return;
  const payload = {
    chat_id: chatId,
    message_id: order.telegramMessageId,
  };
  if (order.telegramKind === "photo") {
    await fetch(`${API}/bot${token}/editMessageCaption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, caption: receiptText(order).slice(0, 1024) }),
    });
    return;
  }
  await fetch(`${API}/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, text: receiptText(order) }),
  });
}
