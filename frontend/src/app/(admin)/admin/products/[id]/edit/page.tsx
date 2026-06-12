"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { fetchAdminProduct } from "@/lib/api/services/admin.service";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => fetchAdminProduct(id),
  });

  if (isLoading) return <p className="text-sm text-stone">Loading product…</p>;
  if (isError || !data) return <p className="text-sm text-maroon">Product not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Catalog</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Edit product</h1>
        <p className="mt-1 text-sm text-stone">{data.name}</p>
      </div>
      <ProductForm product={data} />
    </div>
  );
}
