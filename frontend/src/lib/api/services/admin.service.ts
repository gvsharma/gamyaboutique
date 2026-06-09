import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse, PageResponse } from "@/types/api";
import type {
  AdminCategory,
  DashboardSummary,
  MediaUploadResponse,
  ProductDetail,
  ProductStatus,
  ProductSummary,
  TaxonomyOption,
  UpsertCategoryPayload,
  UpsertProductPayload,
} from "@/types/admin";

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message ?? "Request failed");
  }
  return response.data.data;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await apiClient.get<ApiResponse<DashboardSummary>>(API.adminDashboardSummary);
  return unwrap(res);
}

export async function fetchAdminProducts(params?: {
  page?: number;
  size?: number;
  status?: ProductStatus;
  search?: string;
}): Promise<PageResponse<ProductSummary>> {
  const res = await apiClient.get<ApiResponse<PageResponse<ProductSummary>>>(API.adminProducts, {
    params,
  });
  return unwrap(res);
}

export async function fetchAdminProduct(id: string): Promise<ProductDetail> {
  const res = await apiClient.get<ApiResponse<ProductDetail>>(API.adminProduct(id));
  return unwrap(res);
}

export async function createProduct(payload: UpsertProductPayload): Promise<ProductDetail> {
  const res = await apiClient.post<ApiResponse<ProductDetail>>(API.adminProducts, payload);
  return unwrap(res);
}

export async function updateProduct(id: string, payload: UpsertProductPayload): Promise<ProductDetail> {
  const res = await apiClient.put<ApiResponse<ProductDetail>>(API.adminProduct(id), payload);
  return unwrap(res);
}

export async function updateProductStatus(id: string, status: ProductStatus): Promise<ProductDetail> {
  const res = await apiClient.patch<ApiResponse<ProductDetail>>(API.adminProductStatus(id), {
    status,
  });
  return unwrap(res);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(API.adminProduct(id));
}

export async function uploadProductImage(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "products");
  const res = await apiClient.post<ApiResponse<MediaUploadResponse>>(API.adminMediaUpload, formData);
  return unwrap(res);
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const res = await apiClient.get<ApiResponse<AdminCategory[]>>(API.adminCategories);
  return unwrap(res);
}

export async function createCategory(payload: UpsertCategoryPayload): Promise<AdminCategory> {
  const res = await apiClient.post<ApiResponse<AdminCategory>>(API.adminCategories, payload);
  return unwrap(res);
}

export async function updateCategory(
  id: string,
  payload: UpsertCategoryPayload,
): Promise<AdminCategory> {
  const res = await apiClient.put<ApiResponse<AdminCategory>>(API.adminCategory(id), payload);
  return unwrap(res);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(API.adminCategory(id));
}

export async function fetchFabrics(): Promise<TaxonomyOption[]> {
  const res = await apiClient.get<ApiResponse<TaxonomyOption[]>>(API.adminTaxonomyFabrics);
  return unwrap(res);
}

export async function fetchPrints(): Promise<TaxonomyOption[]> {
  const res = await apiClient.get<ApiResponse<TaxonomyOption[]>>(API.adminTaxonomyPrints);
  return unwrap(res);
}
