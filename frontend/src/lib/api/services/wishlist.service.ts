import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { ProductSummary } from "@/types/product";

export async function fetchWishlist(): Promise<ProductSummary[]> {
  const { data } = await apiClient.get<ApiResponse<ProductSummary[]>>(API.wishlist);
  return data.data;
}

export async function addToWishlist(productId: string): Promise<ProductSummary[]> {
  const { data } = await apiClient.post<ApiResponse<ProductSummary[]>>(
    API.wishlistItem(productId),
  );
  return data.data;
}

export async function removeFromWishlist(productId: string): Promise<ProductSummary[]> {
  const { data } = await apiClient.delete<ApiResponse<ProductSummary[]>>(
    API.wishlistItem(productId),
  );
  return data.data;
}

export async function moveWishlistToCart(productId: string): Promise<void> {
  await apiClient.post(API.wishlistMoveToCart(productId));
}
