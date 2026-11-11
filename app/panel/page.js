import AdminClient from "@/components/AdminClient";
import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { getGames, getOrders, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const ok = await getSession();
  if (!ok) return <LoginForm />;
  const [products, games, orders] = await Promise.all([getProducts(), getGames(), getOrders()]);
  return (
    <AdminClient
      initialProducts={products}
      initialGames={games}
      initialOrders={[...orders].reverse()}
    />
  );
}
