import type { CollectionDto } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";

export type HomepageSlotKey = "FEATURED_COLLECTION" | "CURATED_EDIT";

export interface HomepageSlotDto {
  slotKey: HomepageSlotKey;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  collectionSlug: string | null;
  productIds: string[];
  active: boolean;
}

export interface HomepageDto {
  featuredCollectionSlot: HomepageSlotDto;
  featuredCollection: CollectionDto | null;
  curatedEditSlot: HomepageSlotDto;
  curatedProducts: ProductSummary[];
}

export interface UpsertHomepageSlotPayload {
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  collectionSlug?: string | null;
  productIds?: string[];
  active?: boolean;
}
