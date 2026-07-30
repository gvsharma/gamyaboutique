import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { GIRLS_CHILD_SLUGS } from "@/constants/category-taxonomy";
import {
  filterGirlsProducts,
  filterWomenGirlsProducts,
} from "@/lib/catalog-filters";
import { fetchProducts } from "@/lib/api/services/product.service";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { CategoryDto, CategoryTreeNode, CollectionDto } from "@/types/catalog";
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

export async function fetchCollections(): Promise<CollectionDto[]> {
  const { data } = await apiClient.get<ApiResponse<CollectionDto[]>>(API.collections);
  return data.data;
}

export async function fetchCollection(slug: string): Promise<CollectionDto> {
  const { data } = await apiClient.get<ApiResponse<CollectionDto>>(API.collection(slug));
  return data.data;
}

export async function fetchCollectionProducts(
  slug: string,
  page = 0,
  size = 12,
): Promise<PageResponse<ProductSummary>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<ProductSummary>>>(
    API.collectionProducts(slug),
    { params: { page, size } },
  );
  return data.data;
}

const GIRLS_SLUGS = new Set<string>(["girls", ...GIRLS_CHILD_SLUGS]);

function slicePage<T>(items: T[], page: number, size: number): PageResponse<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const start = page * size;
  return {
    content: items.slice(start, start + size),
    page,
    size,
    totalElements: total,
    totalPages,
    first: page === 0,
    last: page >= totalPages - 1,
  };
}

/** Loads category products with legacy fallbacks for girls taxonomy and miscategorized items. */
export async function fetchCategoryProductsResolved(
  catalogSlug: string,
  page = 0,
  size = 12,
): Promise<PageResponse<ProductSummary>> {
  try {
    const data = await fetchCategoryProducts(catalogSlug, page, size);
    if (data.content.length > 0 || !GIRLS_SLUGS.has(catalogSlug)) {
      const products = GIRLS_SLUGS.has(catalogSlug)
        ? filterGirlsProducts(data.content)
        : filterWomenGirlsProducts(data.content);
      return { ...data, content: products, totalElements: products.length };
    }
  } catch {
    if (!GIRLS_SLUGS.has(catalogSlug)) {
      throw new Error(`Category not found: ${catalogSlug}`);
    }
  }

  if (GIRLS_SLUGS.has(catalogSlug)) {
    const all = await fetchProducts({ page: 0, size: 100 });
    const girls = filterGirlsProducts(all.content);
    return slicePage(girls, page, size);
  }

  throw new Error(`Category not found: ${catalogSlug}`);
}
