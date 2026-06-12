import { Suspense } from "react";
import { CategoryPills } from "@/components/home/category-pills";
import { ShopClient } from "@/components/shop/shop-client";
import { SectionHeader } from "@/components/ui/section-header";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { CategoryTreeNode } from "@/types/catalog";

export const metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  let categories: CategoryTreeNode[] = [];
  try {
    categories = await serverFetch<CategoryTreeNode[]>(API.categoriesTree);
  } catch {
    // API offline — page still renders
  }

  return (
    <div className="pb-16 sm:pb-24">
      <div className="border-b border-charcoal/5 bg-warm py-12 sm:py-16">
        <div className="container-premium">
          <SectionHeader
            align="left"
            eyebrow="Collection"
            title="Shop"
            description="Discover our full collection of couture pieces — sarees, lehengas, and bespoke blouses."
            className="mb-8"
          />
          {categories.length > 0 && <CategoryPills categories={categories} />}
        </div>
      </div>

      <div className="container-premium pt-12 sm:pt-16">
        <Suspense fallback={<p className="text-stone">Loading…</p>}>
          <ShopClient />
        </Suspense>
      </div>
    </div>
  );
}
