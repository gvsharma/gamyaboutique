import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { guestRecentlyViewedStorage } from "@/lib/auth/guest-recently-viewed-storage";
import { filterWomenGirlsProducts } from "@/lib/catalog-filters";
import { fetchProduct } from "@/lib/api/services/product.service";
import type { ApiResponse } from "@/types/api";
import type { ProductDetail, ProductSummary } from "@/types/product";

export async function fetchRecentlyViewedFromApi(): Promise<ProductSummary[]> {
  const { data } = await apiClient.get<ApiResponse<ProductSummary[]>>(
    API.customerRecentlyViewed,
  );
  return filterWomenGirlsProducts(data.data);
}

export async function fetchRecentlyViewedFromGuestStorage(): Promise<ProductSummary[]> {
  const ids = guestRecentlyViewedStorage.getIds();
  if (ids.length === 0) return [];

  const products = await Promise.all(
    ids.map(async (id) => {
      try {
        return await fetchProduct(id);
      } catch {
        return null;
      }
    }),
  );

  return filterWomenGirlsProducts(
    products.filter((product): product is ProductDetail => product != null),
  );
}

export async function recordProductView(productId: string): Promise<void> {
  guestRecentlyViewedStorage.record(productId);
  await apiClient.post(API.productView(productId)).catch(() => undefined);
}
