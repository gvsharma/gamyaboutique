import { GIRLS_CHILD_SLUGS } from "@/constants/category-taxonomy";
import type { CategoryTreeNode } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";

const EXCLUDED_CATEGORY_SLUGS = new Set([
  "men",
  "mens",
  "men-wear",
  "boys",
  "boys-wear",
  "kids",
  "kids-ethnic",
  "sherwanis",
]);

/** Legacy slugs that map to the girls storefront before V21 migration. */
export const GIRLS_CATALOG_SLUGS = [...GIRLS_CHILD_SLUGS, "kids-ethnic"] as const;

const HOMEPAGE_CATEGORY_SLUGS = ["sarees", "blouses", "girls"] as const;

export function isExcludedCategorySlug(slug: string): boolean {
  const s = slug.toLowerCase();
  if (EXCLUDED_CATEGORY_SLUGS.has(s)) return true;
  return s.includes("sherwani") || s.startsWith("men-");
}

export function isWomenGirlsProduct(product: ProductSummary): boolean {
  if (product.primaryCategorySlug && isExcludedCategorySlug(product.primaryCategorySlug)) {
    return false;
  }
  const name = product.name.toLowerCase();
  return !name.includes("sherwani");
}

export function isGirlsCatalogProduct(product: ProductSummary): boolean {
  const slug = product.primaryCategorySlug?.toLowerCase();
  if (slug) {
    if ((GIRLS_CATALOG_SLUGS as readonly string[]).includes(slug)) return true;
    if (slug === "girls") return true;
    if (isExcludedCategorySlug(slug)) return false;
  }
  const name = product.name.toLowerCase();
  return /\b(girl|frock|kids?\s+festive)\b/.test(name);
}

export function filterWomenGirlsProducts<T extends ProductSummary>(products: T[]): T[] {
  return products.filter(isWomenGirlsProduct);
}

export function filterGirlsProducts<T extends ProductSummary>(products: T[]): T[] {
  return products.filter(isGirlsCatalogProduct);
}

export function filterWomenGirlsCategories(categories: CategoryTreeNode[]): CategoryTreeNode[] {
  return categories.filter((c) => !isExcludedCategorySlug(c.slug));
}

export function flattenCategoryTree(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  const walk = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children.length > 0) walk(node.children);
    }
  };
  walk(tree);
  return result;
}

export function pickHomepageCategories(tree: CategoryTreeNode[]): CategoryTreeNode[] {
  const flat = flattenCategoryTree(tree);
  return HOMEPAGE_CATEGORY_SLUGS.map((slug) => flat.find((c) => c.slug === slug)).filter(
    (c): c is CategoryTreeNode => c != null,
  );
}
