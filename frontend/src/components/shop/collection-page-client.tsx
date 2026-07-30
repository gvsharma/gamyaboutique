"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { fetchCollectionProducts } from "@/lib/api/services/catalog.service";
import { queryKeys } from "@/lib/query/query-keys";

export function CollectionPageClient({ slug }: { slug: string }) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.collectionProducts(slug, page),
    queryFn: () => fetchCollectionProducts(slug, page, 12),
    staleTime: 0,
  });

  if (isLoading) return <p className="mt-8 text-center text-stone">Loading…</p>;
  if (isError || !data) {
    return (
      <p className="mt-8 text-center text-stone">
        This collection could not be loaded. Browse our{" "}
        <a href="/shop" className="font-medium text-maroon underline-offset-2 hover:underline">
          full shop
        </a>
        .
      </p>
    );
  }

  const products = data.content;

  if (products.length === 0) {
    return (
      <p className="mt-8 text-center text-stone">
        Pieces for this collection are coming soon. Browse our{" "}
        <a href="/shop" className="font-medium text-maroon underline-offset-2 hover:underline">
          full shop
        </a>
        .
      </p>
    );
  }

  return (
    <div>
      <p className="mb-8 text-sm text-stone">
        {data.totalElements} piece{data.totalElements !== 1 ? "s" : ""} in this edit
      </p>
      <ProductGrid products={products} />
      {data.totalPages > 1 && (
        <div className="mt-14 flex justify-center gap-4">
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
