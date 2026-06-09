"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { fetchAdminProducts, updateProductStatus } from "@/lib/api/services/admin.service";
import type { ProductStatus } from "@/types/admin";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ["admin", "products", status, search],
    queryFn: () =>
      fetchAdminProducts({
        page: 0,
        size: 50,
        status: status || undefined,
        search: search || undefined,
      }),
  });

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this product? It will be hidden from the storefront.")) return;
    setActionError(null);
    try {
      await updateProductStatus(id, "ARCHIVED");
      await refetch();
    } catch {
      setActionError("Failed to archive product.");
    }
  };

  const handlePublish = async (id: string) => {
    setActionError(null);
    try {
      await updateProductStatus(id, "ACTIVE");
      await refetch();
    } catch {
      setActionError("Failed to publish product.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-burgundy">Products</h1>
          <p className="text-sm text-stone">Stored in RDS PostgreSQL · images in S3</p>
        </div>
        <Link href={ROUTES.admin.productNew}>
          <Button>Add product</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="rounded-sm border border-burgundy/20 bg-white px-3 py-2 text-sm"
          placeholder="Search SKU or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-sm border border-burgundy/20 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | "")}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {actionError && <p className="text-sm text-burgundy">{actionError}</p>}
      {isLoading && <p className="text-sm text-stone">Loading products…</p>}
      {isError && <p className="text-sm text-burgundy">Failed to load products from API.</p>}

      <div className="overflow-x-auto rounded-sm border border-burgundy/10 bg-cream">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-burgundy/10 text-xs uppercase tracking-wider text-stone">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((product) => (
              <tr key={product.id} className="border-b border-burgundy/5">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-sm bg-ivory">
                    {product.primaryImageUrl ? (
                      <Image
                        src={product.primaryImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] text-stone">
                        No img
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-sm bg-ivory px-2 py-0.5 text-xs uppercase">
                    {product.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">{formatPrice(product.effectivePrice, product.currency)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={ROUTES.admin.productEdit(product.id)}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                    {product.status !== "ACTIVE" && (
                      <Button size="sm" variant="secondary" onClick={() => handlePublish(product.id)}>
                        Publish
                      </Button>
                    )}
                    {product.status !== "ARCHIVED" && (
                      <Button size="sm" variant="ghost" onClick={() => handleArchive(product.id)}>
                        Archive
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-stone">No products found.</p>
        )}
      </div>
    </div>
  );
}
