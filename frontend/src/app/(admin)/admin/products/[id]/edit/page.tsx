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
  if (isError || !data) return <p className="text-sm text-burgundy">Product not found.</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-burgundy">Edit product</h1>
      <ProductForm product={data} />
    </div>
  );
}
