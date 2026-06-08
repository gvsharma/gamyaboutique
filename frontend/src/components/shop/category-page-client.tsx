"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { fetchCategoryProducts } from "@/lib/api/services/catalog.service";
import { queryKeys } from "@/lib/query/query-keys";

export function CategoryPageClient({ slug }: { slug: string }) {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.categoryProducts(slug, page),
    queryFn: () => fetchCategoryProducts(slug, page, 12),
  });

  if (isLoading) return <p className="mt-10 text-center text-stone">Loading…</p>;
  if (isError) {
    return (
      <p className="mt-10 text-center text-burgundy">
        Could not load this category. Check the API is running.
      </p>
    );
  }

  return (
    <div className="mt-10">
      {data && (
        <p className="mb-6 text-sm text-stone">{data.totalElements} pieces</p>
      )}
      <ProductGrid products={data?.content ?? []} />
      {data && data.totalPages > 1 && (
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
