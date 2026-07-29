import type { CategoryLike } from "@/constants/category-taxonomy";

/** Client-side SKU when backend auto-generation is unavailable (e.g. before deploy). */
export function generateProductSku(
  name: string,
  categoryId: string,
  categories: CategoryLike[],
): string {
  const category = categories.find((item) => item.id === categoryId);
  let prefix = "GC";
  if (category?.slug) {
    const compact = category.slug.replace(/-/g, "").toUpperCase();
    prefix = compact.slice(0, Math.min(4, compact.length)) || "GC";
  }
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${slug || "PRODUCT"}-${suffix}`.replace(/--+/g, "-");
}
