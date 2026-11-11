import CatalogClient from "@/components/CatalogClient";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  return <CatalogClient products={products} />;
}
