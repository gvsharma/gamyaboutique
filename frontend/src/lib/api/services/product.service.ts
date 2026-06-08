import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { ProductDetail, ProductSummary } from "@/types/product";

export interface ProductListParams {
  page?: number;
  size?: number;
  q?: string;
  categorySlug?: string;
  fabricSlug?: string;
  onOffer?: boolean;
}

export async function fetchProducts(
  params: ProductListParams = {},
): Promise<PageResponse<ProductSummary>> {
  const { page = 0, size = 12, q, ...filters } = params;
  const path = q ? API.productSearch : API.products;
  const { data } = await apiClient.get<ApiResponse<PageResponse<ProductSummary>>>(path, {
    params: { page, size, q, ...filters },
  });
  return data.data;
}

export async function fetchProduct(id: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(API.product(id));
  return data.data;
}

export async function submitInterest(
  productId: string,
  body: { email: string; phone: string; message?: string },
): Promise<{ id: string }> {
  const { data } = await apiClient.post<ApiResponse<{ id: string }>>(
    API.productInterest(productId),
    body,
  );
  return data.data;
}
