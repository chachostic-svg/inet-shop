import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import PartGlyph from "@/components/PartGlyph";
import ProductActions from "@/components/ProductActions";
import { formatPrice } from "@/lib/money";
import { getDict } from "@/lib/i18n";
import { getProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

function Spec({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <li className="flex justify-between border-b border-line py-2">
      <span className="text-muted">{label}</span>
      <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>
    </li>
  );
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  const jar = await cookies();
  const locale = jar.get("locale")?.value === "uz" ? "uz" : "ru";
  const t = getDict(locale);

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex items-center justify-center border border-line bg-panel p-10">
        <PartGlyph type={product.type} color={product.color} className="h-48 w-48" />
      </div>
      <div>
        <Link href="/" className="text-sm text-muted">
          {t.product.back}
        </Link>
        <p className="mt-4 text-sm text-muted">{t.types[product.type]}</p>
        <h1 className="display mt-1 text-3xl">
          {product.brand} {product.name}
        </h1>
        <p className="mt-4 text-muted">{product.description?.[locale] || product.description?.ru}</p>
        <p className="display mt-6 text-3xl">{formatPrice(product.price, locale)}</p>
        <p className={`mt-2 text-sm ${product.stock > 0 ? "text-signal" : "text-danger"}`}>
          {product.stock > 0 ? t.catalog.inStock : t.catalog.out}
        </p>
        <ul className="mt-6 text-sm">
          <Spec label={t.product.socket} value={product.socket || (product.sockets || []).join(", ")} />
          <Spec label={t.product.tdp} value={product.tdp} />
          <Spec label={t.product.fpsScore} value={product.fpsScore} />
          <Spec label={t.product.ramType} value={product.ramType} />
          <Spec label={t.product.formFactor} value={product.formFactor || (product.formFactors || []).join(", ")} />
          <Spec label={t.product.capacity} value={product.capacityGb ? `${product.capacityGb} GB` : product.specs?.capacity} />
          <Spec label={t.product.length} value={product.lengthMm ? `${product.lengthMm} mm` : null} />
          <Spec label={t.product.height} value={product.heightMm ? `${product.heightMm} mm` : null} />
          <Spec label={t.product.wattage} value={product.wattage ? `${product.wattage} W` : null} />
          <Spec label={t.product.gpuMax} value={product.gpuMaxMm ? `${product.gpuMaxMm} mm` : null} />
          <Spec label={t.product.coolerMax} value={product.coolerMaxMm ? `${product.coolerMaxMm} mm` : null} />
        </ul>
        <ProductActions product={product} />
      </div>
    </div>
  );
}
