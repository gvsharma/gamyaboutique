"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CatalogImage } from "@/components/ui/catalog-image";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { fetchAdminProducts, updateProductStatus } from "@/lib/api/services/admin.service";
import type { ProductStatus } from "@/types/admin";
import {
  normalizeProductImage,
  productPlaceholderImage,
} from "@/lib/category-images";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const { toast } = useToast();
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
      toast("Product archived");
      await refetch();
    } catch {
      setActionError("Failed to archive product.");
      toast("Failed to archive product", "error");
    }
  };

  const handlePublish = async (id: string) => {
    setActionError(null);
    try {
      await updateProductStatus(id, "ACTIVE");
      toast("Product published");
      await refetch();
    } catch {
      setActionError("Failed to publish product.");
      toast("Failed to publish product", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-eyebrow">Catalog</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">Products</h1>
          <p className="mt-1 text-sm text-stone">Stored in RDS · images in S3</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={ROUTES.admin.productImport}>
            <Button variant="outline">Import CSV</Button>
          </Link>
          <Link href={ROUTES.admin.productNew}>
            <Button>Add product</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="admin-input !mt-0 w-64"
          placeholder="Search SKU or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input !mt-0"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | "")}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {actionError && <p className="text-sm text-maroon">{actionError}</p>}
      {isLoading && <p className="text-sm text-stone">Loading products…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load products from API.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Image</th>
              <th className="px-5 py-3.5">SKU</th>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((product) => (
              <tr key={product.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-ivory">
                    <CatalogImage
                      src={normalizeProductImage(
                        product.primaryImageUrl,
                        product.primaryCategorySlug,
                        product.name,
                      )}
                      fallbackSrc={productPlaceholderImage(
                        product.primaryCategorySlug,
                        product.name,
                      )}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-stone">{product.sku}</td>
                <td className="px-5 py-3.5 text-charcoal">{product.name}</td>
                <td className="px-5 py-3.5">
                  <span className="chip">{product.status ?? "—"}</span>
                </td>
                <td className="px-5 py-3.5 text-maroon">{formatPrice(product.effectivePrice, product.currency)}</td>
                <td className="px-5 py-3.5">
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
          <p className="px-5 py-10 text-center text-sm text-stone">No products found.</p>
        )}
      </div>
    </div>
  );
}
