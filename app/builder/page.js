import BuilderClient from "@/components/BuilderClient";
import { getGames, getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  const [products, games] = await Promise.all([getProducts(), getGames()]);
  return <BuilderClient products={products} games={games} />;
}
