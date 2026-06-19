"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { fetchCategoryProductsResolved } from "@/lib/api/services/catalog.service";
import { resolveCatalogSlug } from "@/lib/category-slugs";
import { queryKeys } from "@/lib/query/query-keys";

export function CategoryPageClient({ slug }: { slug: string }) {
  const [page, setPage] = useState(0);
  const catalogSlug = resolveCatalogSlug(slug);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.categoryProducts(catalogSlug, page),
    queryFn: () => fetchCategoryProductsResolved(catalogSlug, page, 12),
    staleTime: 0,
  });

  if (isLoading) return <p className="mt-10 text-center text-stone">Loading…</p>;
  if (isError || !data) {
    return (
      <p className="mt-10 text-center text-stone">
        No pieces in this collection yet. Browse our{" "}
        <a href="/shop" className="font-medium text-maroon underline-offset-2 hover:underline">
          full shop
        </a>{" "}
        or contact us for bespoke styling.
      </p>
    );
  }

  const products = data.content;

  if (products.length === 0) {
    return (
      <p className="mt-10 text-center text-stone">
        No pieces in this collection yet. Browse our{" "}
        <a href="/shop" className="font-medium text-maroon underline-offset-2 hover:underline">
          full shop
        </a>{" "}
        or contact us for bespoke styling.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-stone">
        {data.totalElements} piece{data.totalElements !== 1 ? "s" : ""}
      </p>
      <ProductGrid products={products} />
      {data.totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-4">
          <Button variant="outline" disabled={data.first} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-stone">
            Page {data.page + 1} of {data.totalPages}
          </span>
          <Button variant="outline" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
