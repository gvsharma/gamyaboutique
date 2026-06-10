"use client";

import { useQuery } from "@tanstack/react-query";
import { ProductCarousel } from "@/components/home/product-carousel";
import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { ProductSummary } from "@/types/product";

interface RelatedProductsProps {
  productId: string;
  title?: string;
}

export function RelatedProducts({ productId, title = "You may also like" }: RelatedProductsProps) {
  const { data: products = [] } = useQuery({
    queryKey: ["related", productId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ProductSummary[]>>(API.productRelated(productId));
      return data.data;
    },
  });

  if (products.length === 0) return null;

  return (
    <ProductCarousel
      products={products}
      eyebrow="Style edit"
      title={title}
      className="!px-0 py-12"
    />
  );
}
