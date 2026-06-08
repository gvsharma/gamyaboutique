"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/lib/api/services/product.service";
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
        className="mb-10 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sarees, fabrics, prints…"
          className="flex-1 rounded-sm border border-burgundy/20 bg-white px-4 py-3 text-sm outline-none ring-burgundy/30 focus:ring-2"
          autoFocus={searchParams.get("focus") === "search"}
        />
        <Button type="submit" variant="primary">
          Search
        </Button>
      </form>

      {isLoading && (
        <p className="py-16 text-center text-stone">Loading collection…</p>
      )}
      {isError && (
        <p className="py-16 text-center text-burgundy">
          Could not load products. Is the API running on port 8080?
        </p>
      )}
      {data && (
        <>
          <p className="mb-6 text-sm text-stone">
            {data.totalElements} piece{data.totalElements !== 1 ? "s" : ""}
            {q ? ` for “${q}”` : ""}
          </p>
          <ProductGrid products={data.content} />
          <div className="mt-12 flex justify-center gap-4">
            <Button
              variant="outline"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-stone">
              Page {data.page + 1} of {data.totalPages || 1}
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
      )}
    </div>
  );
}
