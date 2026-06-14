"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/lib/api/services/product.service";
import { filterWomenGirlsProducts } from "@/lib/catalog-filters";
import { queryKeys } from "@/lib/query/query-keys";

export function ShopClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setQ(initialQ);
    setPage(0);
  }, [initialQ]);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.products({ q, page }),
    queryFn: () => fetchProducts({ page, size: 12, q: q || undefined }),
  });

  return (
    <div>
      <form
        className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sarees, lehengas, fabrics…"
          className="input-premium flex-1"
          autoFocus={searchParams.get("focus") === "search"}
        />
        <Button type="submit" variant="primary" className="sm:min-w-[7rem]">
          Search
        </Button>
      </form>

      {isLoading && <ProductGridSkeleton count={8} />}
      {isError && (
        <p className="py-16 text-center text-maroon">
          Could not load products. Please try again shortly.
        </p>
      )}
      {data && (() => {
        const products = filterWomenGirlsProducts(data.content);
        return (
        <>
          <p className="mb-8 text-sm uppercase tracking-wider text-stone">
            {products.length} piece{products.length !== 1 ? "s" : ""}
            {q ? ` for “${q}”` : ""}
          </p>
          <ProductGrid products={products} />
          <div className="mt-16 flex justify-center gap-4">
            <Button
              variant="outline"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-stone">
              {data.page + 1} / {data.totalPages || 1}
            </span>
            <Button
              variant="outline"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
        );
      })()}
    </div>
  );
}
