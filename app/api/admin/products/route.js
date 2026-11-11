import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProducts, saveProducts } from "@/lib/store";

export async function PUT(request) {
  if (!(await getSession())) return NextResponse.json({ error: "auth" }, { status: 401 });
  const patch = await request.json();
  const products = await getProducts();
  const index = products.findIndex((item) => item.id === patch.id);
  if (index < 0) return NextResponse.json({ error: "missing" }, { status: 404 });
  products[index] = { ...products[index], ...patch, id: products[index].id };
  await saveProducts(products);
  return NextResponse.json({ products });
}
