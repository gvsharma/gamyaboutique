import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CategoryDto, CategoryTreeNode } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";

export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  const { data } = await apiClient.get<ApiResponse<CategoryTreeNode[]>>(API.categoriesTree);
  return data.data;
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<ApiResponse<CategoryDto[]>>(API.catalogCategories);
  return data.data;
}

export async function fetchCategoryProducts(
  slug: string,
  page = 0,
  size = 12,
): Promise<PageResponse<ProductSummary>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<ProductSummary>>>(
    API.categoryProducts(slug),
    { params: { page, size } },
  );
  return data.data;
}
