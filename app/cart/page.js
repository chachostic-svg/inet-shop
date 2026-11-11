import CartClient from "@/components/CartClient";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await getProducts();
  return <CartClient products={products} />;
}
