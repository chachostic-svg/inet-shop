import { cookies } from "next/headers";
import OrderPayForm from "@/components/OrderPayForm";
import { getDict } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import { getPaymentRequisites } from "@/lib/payment";
import { getOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const orders = await getOrders();
  const order = orders.find((item) => item.id === id);
  const jar = await cookies();
  const locale = jar.get("locale")?.value === "uz" ? "uz" : "ru";
  const t = getDict(locale);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="display text-3xl">{t.order.title}</h1>
        <p className="mt-4 text-muted">{t.order.notFound}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="display text-3xl">
        {t.order.title} {order.id}
      </h1>
      <p className="mt-4 text-lg">{t.order[order.status] || order.status}</p>
      <p className="mt-2 text-muted">
        {order.name} · {order.phone} · {order.city}
      </p>
      <ul className="mt-6 space-y-2 border border-line bg-panel p-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{formatPrice(item.price * item.qty, locale)}</span>
          </li>
        ))}
      </ul>
      <p className="display mt-4 text-2xl">{formatPrice(order.total, locale)}</p>
      {order.paymentMethod && (
        <p className="mt-3 text-sm text-muted">
          {t.checkout[order.paymentMethod] || order.paymentMethod}
          {order.paymentRef ? ` · ${order.paymentRef}` : ""}
        </p>
      )}
      {order.receiptImage && (
        <div className="mt-6">
          <p className="mb-2 text-sm text-muted">{t.order.receiptPreview}</p>
          <img
            src={`/api/orders/${order.id}/receipt`}
            alt=""
            className="max-h-72 w-full border border-line object-contain"
          />
        </div>
      )}
      {order.status === "pending" && !order.receiptImage && (
        <OrderPayForm orderId={order.id} total={order.total} requisites={getPaymentRequisites()} />
      )}
      {order.status === "pending" && order.receiptImage && (
        <p className="mt-4 text-sm text-signal">{t.order.paidNote}</p>
      )}
      {query.tg === "0" && <p className="mt-4 text-sm text-danger">{t.checkout.telegramWarn}</p>}
    </div>
  );
}
