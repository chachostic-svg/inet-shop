import { Bot } from "grammy";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function updateOrderStatus(id, status) {
  const { rows } = await pool.query("select data from orders where id = $1", [id]);
  if (!rows.length) return null;
  const order = { ...rows[0].data, status };
  await pool.query("update orders set data = $1::jsonb where id = $2", [JSON.stringify(order), id]);
  return order;
}

function receiptText(order) {
  const lines = order.items
    .map((item) => `• ${item.name} × ${item.qty} — ${item.price.toLocaleString("ru-RU")}`)
    .join("\n");
  const status =
    order.status === "paid" ? "оплачен" : order.status === "rejected" ? "отклонён" : "ожидает оплаты";
  return [
    `Чек заказа ${order.id}`,
    `${order.name} · ${order.phone} · ${order.city}`,
    lines,
    `Итого: ${order.total.toLocaleString("ru-RU")} сум`,
    `Оплата: ${order.paymentMethod || "—"} · ${order.paymentRef || "без номера"}`,
    `Статус: ${status}`,
  ].join("\n");
}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Set TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

const bot = new Bot(token);

function ownerId() {
  return String(process.env.TELEGRAM_CHAT_ID || "").trim();
}

function idReply(ctx) {
  const id = ctx.from?.id;
  const owner = ownerId();
  const lines = [
    `Ваш Telegram id: ${id}`,
    "Добавьте его в файл .env:",
    `TELEGRAM_CHAT_ID=${id}`,
    "После этого перезапустите сайт и бота. Чеки будут приходить только на этот аккаунт.",
  ];
  if (owner && owner === String(id)) {
    lines.push("Этот аккаунт уже указан как получатель чеков.");
  } else if (owner) {
    lines.push(`Сейчас в .env стоит другой id: ${owner}`);
  }
  return ctx.reply(lines.join("\n"));
}

bot.command("start", (ctx) => idReply(ctx));
bot.command("id", (ctx) => idReply(ctx));
bot.on("message:text", (ctx) => idReply(ctx));

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data || "";
  const [status, id] = data.split(":");
  if (!["paid", "rejected"].includes(status) || !id) {
    await ctx.answerCallbackQuery();
    return;
  }
  const order = await updateOrderStatus(id, status);
  if (!order) {
    await ctx.answerCallbackQuery({ text: "Заказ не найден" });
    return;
  }
  const text = receiptText(order);
  if (ctx.callbackQuery.message?.photo) {
    await ctx.editMessageCaption(text.slice(0, 1024));
  } else {
    await ctx.editMessageText(text);
  }
  await ctx.answerCallbackQuery({ text: status === "paid" ? "Оплачен" : "Отклонён" });
});

bot.start({
  onStart: (info) => console.log(`Bot @${info.username} is running`),
});
