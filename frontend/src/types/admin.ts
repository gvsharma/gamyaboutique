import type { CategorySummaryDto, ProductDetail, ProductSummary } from "@/types/product";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface DashboardSummary {
  activeProducts: number;
  activeCategories: number;
  openLeads: number;
  recentInterests: number;
}

export interface TaxonomyOption {
  id: string;
  name: string;
  slug: string;
}

export interface AdminCategory extends CategorySummaryDto {
  description: string | null;
  displayOrder: number;
  parentId: string | null;
}

export interface ProductImageInput {
  url: string;
  altText?: string;
  displayOrder: number;
}

export interface UpsertProductPayload {
  sku: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  status?: ProductStatus;
  primaryCategoryId?: string | null;
  fabricId?: string | null;
  printId?: string | null;
  categoryIds?: string[];
  images?: ProductImageInput[];
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
}

export interface UpsertCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  active?: boolean;
}

export interface MediaUploadResponse {
  url: string;
  storageProvider: string;
}

export type { ProductDetail, ProductSummary };
