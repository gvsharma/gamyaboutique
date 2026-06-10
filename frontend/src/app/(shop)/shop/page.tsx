import { Suspense } from "react";
import { ShopClient } from "@/components/shop/shop-client";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return (
    <div className="container-premium py-12 sm:py-16 lg:py-20">
      <SectionHeader
        align="left"
        eyebrow="Collection"
        title="Shop"
        description="Discover our full collection of couture pieces — sarees, lehengas, and bespoke blouses."
        className="mb-10"
      />
      <Suspense fallback={<p className="text-stone">Loading…</p>}>
        <ShopClient />
      </Suspense>
    </div>
  );
}
