/** Storefront + admin category taxonomy (Women & Girls only). */

export const ALLOWED_ROOT_SLUGS = ["women", "girls"] as const;

export const WOMEN_CHILD_SLUGS = ["sarees", "kurtas", "lehengas", "blouses"] as const;

/** Globally unique slugs — distinct from women's kurtas/lehengas. */
export const GIRLS_CHILD_SLUGS = ["girls-kurtas", "girls-lehengas"] as const;

export const PRODUCT_ASSIGNABLE_SLUGS = [...WOMEN_CHILD_SLUGS, ...GIRLS_CHILD_SLUGS] as const;

export type ProductAssignableSlug = (typeof PRODUCT_ASSIGNABLE_SLUGS)[number];

export interface CategoryLike {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
}

export function isAllowedRootSlug(slug: string): boolean {
  return (ALLOWED_ROOT_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

/** e.g. "girls-kurtas" → "Girls Kurtas" */
export function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isProductAssignableSlug(slug: string): slug is ProductAssignableSlug {
  return (PRODUCT_ASSIGNABLE_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

export function findCategoryBySlug(categories: CategoryLike[], slug: string): CategoryLike | undefined {
  return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

export function isProductAssignableCategory(category: CategoryLike, categories: CategoryLike[]): boolean {
  if (!category.parentId) return false;
  const parent = categories.find((c) => c.id === category.parentId);
  if (!parent) return false;
  if (parent.slug === "women") {
    return (WOMEN_CHILD_SLUGS as readonly string[]).includes(category.slug);
  }
  if (parent.slug === "girls") {
    return (GIRLS_CHILD_SLUGS as readonly string[]).includes(category.slug);
  }
  return false;
}

export function productAssignableCategories(categories: CategoryLike[]): CategoryLike[] {
  return categories
    .filter((c) => isProductAssignableCategory(c, categories))
    .sort((a, b) => {
      const parentA = categories.find((p) => p.id === a.parentId)?.slug ?? "";
      const parentB = categories.find((p) => p.id === b.parentId)?.slug ?? "";
      if (parentA !== parentB) return parentA.localeCompare(parentB);
      return a.name.localeCompare(b.name);
    });
}

export function adminVisibleCategories<T extends CategoryLike>(categories: T[]): T[] {
  const allowed = new Set<string>([...ALLOWED_ROOT_SLUGS, ...WOMEN_CHILD_SLUGS, ...GIRLS_CHILD_SLUGS]);
  return categories.filter((c) => allowed.has(c.slug.toLowerCase()));
}

export function categoryOptionLabel(category: CategoryLike, categories: CategoryLike[]): string {
  const parent = category.parentId ? categories.find((c) => c.id === category.parentId) : null;
  return parent ? `${parent.name} → ${category.name}` : category.name;
}
