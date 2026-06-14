import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse, PageResponse } from "@/types/api";
import type {
  AdminCartDetail,
  AdminCartSummary,
  AdminCategory,
  AdminCustomerDetail,
  AdminCustomerSummary,
  AdminFabric,
  AdminOffer,
  AdminPrint,
  AdminTag,
  AdminUserDetail,
  AdminUserSummary,
  AdminWishlistSummary,
  CrmLead,
  CustomerInterest,
  CustomerInterestStatus,
  DashboardSummary,
  MediaUploadResponse,
  ProductDetail,
  ProductStatus,
  ProductSummary,
  TaxonomyOption,
  UpsertCategoryPayload,
  UpsertFabricPayload,
  UpsertOfferPayload,
  UpsertPrintPayload,
  UpsertProductPayload,
  UpsertTagPayload,
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

export async function uploadProductVideo(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "videos");
  const res = await apiClient.post<ApiResponse<MediaUploadResponse>>(API.adminMediaUploadVideo, formData);
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

export async function fetchAdminUsers(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminUserSummary>> {
  const res = await apiClient.get<ApiResponse<PageResponse<AdminUserSummary>>>(API.adminUsers, {
    params,
  });
  return unwrap(res);
}

export async function fetchAdminUser(id: string): Promise<AdminUserDetail> {
  const res = await apiClient.get<ApiResponse<AdminUserDetail>>(API.adminUser(id));
  return unwrap(res);
}

export async function updateUserEnabled(id: string, enabled: boolean): Promise<AdminUserSummary> {
  const res = await apiClient.patch<ApiResponse<AdminUserSummary>>(API.adminUserEnabled(id), {
    enabled,
  });
  return unwrap(res);
}

export async function fetchAdminCarts(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminCartSummary>> {
  const res = await apiClient.get<ApiResponse<PageResponse<AdminCartSummary>>>(API.adminCarts, {
    params,
  });
  return unwrap(res);
}

export async function fetchAdminCart(id: string): Promise<AdminCartDetail> {
  const res = await apiClient.get<ApiResponse<AdminCartDetail>>(API.adminCart(id));
  return unwrap(res);
}

export async function fetchAdminWishlists(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminWishlistSummary>> {
  const res = await apiClient.get<ApiResponse<PageResponse<AdminWishlistSummary>>>(API.adminWishlists, {
    params,
  });
  return unwrap(res);
}

export async function deleteWishlistItem(id: string): Promise<void> {
  await apiClient.delete(API.adminWishlist(id));
}

export async function fetchAdminCustomers(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<AdminCustomerSummary>> {
  const res = await apiClient.get<ApiResponse<PageResponse<AdminCustomerSummary>>>(API.adminCustomers, {
    params,
  });
  return unwrap(res);
}

export async function fetchAdminCustomer(id: string): Promise<AdminCustomerDetail> {
  const res = await apiClient.get<ApiResponse<AdminCustomerDetail>>(API.adminCustomer(id));
  return unwrap(res);
}

export async function fetchAdminInterests(params?: {
  page?: number;
  size?: number;
  status?: CustomerInterestStatus;
}): Promise<PageResponse<CustomerInterest>> {
  const res = await apiClient.get<ApiResponse<PageResponse<CustomerInterest>>>(API.adminInterests, {
    params,
  });
  return unwrap(res);
}

export async function updateInterestStatus(
  id: string,
  status: CustomerInterestStatus,
  note?: string,
): Promise<CustomerInterest> {
  const res = await apiClient.put<ApiResponse<CustomerInterest>>(API.adminInterestStatus(id), {
    status,
    note,
  });
  return unwrap(res);
}

export async function fetchCrmLeads(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<CrmLead>> {
  const res = await apiClient.get<ApiResponse<PageResponse<CrmLead>>>(API.crmLeads, { params });
  return unwrap(res);
}

export async function fetchAdminFabrics(): Promise<AdminFabric[]> {
  const res = await apiClient.get<ApiResponse<AdminFabric[]>>(API.adminTaxonomyFabricsAll);
  return unwrap(res);
}

export async function createFabric(payload: UpsertFabricPayload): Promise<AdminFabric> {
  const res = await apiClient.post<ApiResponse<AdminFabric>>("/admin/taxonomy/fabrics", payload);
  return unwrap(res);
}

export async function updateFabric(id: string, payload: UpsertFabricPayload): Promise<AdminFabric> {
  const res = await apiClient.put<ApiResponse<AdminFabric>>(API.adminTaxonomyFabric(id), payload);
  return unwrap(res);
}

export async function deleteFabric(id: string): Promise<void> {
  await apiClient.delete(API.adminTaxonomyFabric(id));
}

export async function fetchAdminPrints(): Promise<AdminPrint[]> {
  const res = await apiClient.get<ApiResponse<AdminPrint[]>>(API.adminTaxonomyPrintsAll);
  return unwrap(res);
}

export async function createPrint(payload: UpsertPrintPayload): Promise<AdminPrint> {
  const res = await apiClient.post<ApiResponse<AdminPrint>>("/admin/taxonomy/prints", payload);
  return unwrap(res);
}

export async function updatePrint(id: string, payload: UpsertPrintPayload): Promise<AdminPrint> {
  const res = await apiClient.put<ApiResponse<AdminPrint>>(API.adminTaxonomyPrint(id), payload);
  return unwrap(res);
}

export async function deletePrint(id: string): Promise<void> {
  await apiClient.delete(API.adminTaxonomyPrint(id));
}

export async function fetchAdminTags(): Promise<AdminTag[]> {
  const res = await apiClient.get<ApiResponse<AdminTag[]>>(API.adminTaxonomyTagsAll);
  return unwrap(res);
}

export async function createTag(payload: UpsertTagPayload): Promise<AdminTag> {
  const res = await apiClient.post<ApiResponse<AdminTag>>("/admin/taxonomy/tags", payload);
  return unwrap(res);
}

export async function updateTag(id: string, payload: UpsertTagPayload): Promise<AdminTag> {
  const res = await apiClient.put<ApiResponse<AdminTag>>(API.adminTaxonomyTag(id), payload);
  return unwrap(res);
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(API.adminTaxonomyTag(id));
}

export async function fetchAdminOffers(): Promise<AdminOffer[]> {
  const res = await apiClient.get<ApiResponse<AdminOffer[]>>(API.adminTaxonomyOffersAll);
  return unwrap(res);
}

export async function createOffer(payload: UpsertOfferPayload): Promise<AdminOffer> {
  const res = await apiClient.post<ApiResponse<AdminOffer>>("/admin/taxonomy/offers", payload);
  return unwrap(res);
}

export async function updateOffer(id: string, payload: UpsertOfferPayload): Promise<AdminOffer> {
  const res = await apiClient.put<ApiResponse<AdminOffer>>(API.adminTaxonomyOffer(id), payload);
  return unwrap(res);
}

export async function deleteOffer(id: string): Promise<void> {
  await apiClient.delete(API.adminTaxonomyOffer(id));
}
