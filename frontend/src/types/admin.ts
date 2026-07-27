import type { CategorySummaryDto, ProductColor, ProductDetail, ProductSummary } from "@/types/product";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type CustomerInterestStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "TRIAL_BOOKED"
  | "CONFIRMED"
  | "DELIVERED"
  | "LOST";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "WON";

export type LeadSource = "WEBSITE" | "CUSTOMER_INTEREST" | "REFERRAL" | "WALK_IN" | "OTHER";

export type CartStatus = "ACTIVE" | "MERGED" | "ABANDONED";

export type TagType = "GENERAL" | "OFFER" | "SEASONAL" | "FEATURE" | "COLLECTION";

export type DiscountType = "PERCENT" | "FIXED";

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
  imageUrl?: string | null;
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
  videoUrl?: string | null;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  availableSizes?: string[];
  availableColors?: ProductColor[];
}

export interface UpsertCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  active?: boolean;
  imageUrl?: string | null;
}

export interface UpsertLeadPayload {
  name: string;
  email: string;
  phone?: string;
  source?: LeadSource;
  notes?: string;
  productId?: string | null;
  customerId?: string | null;
}

export interface MediaUploadResponse {
  url: string;
  storageProvider: string;
}

export interface AdminUserSummary {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  updatedAt: string;
  customerId: string | null;
  cartCount: number;
  wishlistCount: number;
}

export interface AdminCartSummary {
  id: string;
  customerId: string | null;
  guestToken: string | null;
  status: CartStatus;
  itemCount: number;
  updatedAt: string;
  customerEmail: string | null;
  customerName: string | null;
}

export interface AdminCartItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number | null;
}

export interface AdminCartDetail {
  id: string;
  customerId: string | null;
  guestToken: string | null;
  status: CartStatus;
  createdAt: string;
  updatedAt: string;
  customerEmail: string | null;
  customerName: string | null;
  items: AdminCartItem[];
}

export interface AdminWishlistSummary {
  id: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  productId: string;
  productName: string;
  createdAt: string;
}

export interface AdminCustomerSummary {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  userId: string | null;
  createdAt: string;
}

export interface AdminCustomerDetail extends AdminCustomerSummary {
  notes: string | null;
  updatedAt: string;
  wishlistCount: number;
  cartCount: number;
}

export interface InterestProductSummary {
  id: string;
  name: string;
  sku: string;
}

export interface CustomerInterest {
  id: string;
  product: InterestProductSummary;
  customerName: string | null;
  phone: string | null;
  whatsapp: string | null;
  size: string | null;
  color: string | null;
  message: string | null;
  status: CustomerInterestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CrmLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  productId: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFabric {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  composition: string | null;
  active: boolean;
}

export interface AdminPrint {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  patternType: string | null;
  active: boolean;
}

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
  tagType: TagType;
}

export interface AdminOffer {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

export interface UpsertFabricPayload {
  name: string;
  slug?: string;
  description?: string;
  composition?: string;
  active?: boolean;
}

export interface UpsertPrintPayload {
  name: string;
  slug?: string;
  description?: string;
  patternType?: string;
  active?: boolean;
}

export interface UpsertTagPayload {
  name: string;
  slug?: string;
  tagType?: TagType;
}

export interface UpsertOfferPayload {
  name: string;
  code?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active?: boolean;
}

export type { ProductDetail, ProductSummary };
