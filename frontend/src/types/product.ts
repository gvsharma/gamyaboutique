export interface FabricDto {
  id: string;
  name: string;
  slug: string;
}

export interface PrintDto {
  id: string;
  name: string;
  slug: string;
}

export interface OfferSummaryDto {
  id: string;
  name: string;
  code: string;
}

export interface TagDto {
  id: string;
  name: string;
  slug: string;
}

export interface CategorySummaryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImageDto {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  primary: boolean;
}

export interface ProductSummary {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  effectivePrice: number;
  onOffer: boolean;
  currency: string;
  primaryImageUrl: string | null;
  fabric: FabricDto | null;
  print: PrintDto | null;
  offer: OfferSummaryDto | null;
  tags: TagDto[];
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  status: string;
  categories: CategorySummaryDto[];
  images: ProductImageDto[];
}
