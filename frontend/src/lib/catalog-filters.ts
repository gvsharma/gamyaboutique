import type { CategoryTreeNode } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";

const EXCLUDED_CATEGORY_SLUGS = new Set([
  "men",
  "mens",
  "men-wear",
  "boys",
  "boys-wear",
  "kids",
]);

const HOMEPAGE_CATEGORY_SLUGS = ["sarees", "lehengas", "girls-collection"] as const;

export function isExcludedCategorySlug(slug: string): boolean {
  const s = slug.toLowerCase();
  if (EXCLUDED_CATEGORY_SLUGS.has(s)) return true;
  return s.includes("sherwani") || s.startsWith("men-") || s.includes("boys");
}

export function isWomenGirlsProduct(product: ProductSummary): boolean {
  if (product.primaryCategorySlug && isExcludedCategorySlug(product.primaryCategorySlug)) {
    return false;
  }
  const name = product.name.toLowerCase();
  if (name.includes("sherwani")) return false;
  if (name.includes("kids festive kurta")) return false;
  return true;
}

export function filterWomenGirlsProducts<T extends ProductSummary>(products: T[]): T[] {
  return products.filter(isWomenGirlsProduct);
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
