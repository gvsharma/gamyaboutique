import { Suspense } from "react";
import { ShopClient } from "@/components/shop/shop-client";

export const metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-burgundy sm:text-4xl">Shop</h1>
      <p className="mt-2 text-stone">Discover our full collection of couture pieces.</p>
      <div className="mt-10">
        <Suspense fallback={<p className="text-stone">Loading…</p>}>
          <ShopClient />
        </Suspense>
      </div>
    </div>
  );
}
