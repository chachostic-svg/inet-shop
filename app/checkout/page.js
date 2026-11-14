import { Suspense } from "react";
import CheckoutForm from "@/components/CheckoutForm";
import { getPaymentRequisites } from "@/lib/payment";
import { getProducts } from "@/lib/store";
import { isStripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const products = await getProducts();
  return (
    <Suspense>
      <CheckoutForm products={products} requisites={getPaymentRequisites()} stripeEnabled={isStripeEnabled()} />
    </Suspense>
  );
}
