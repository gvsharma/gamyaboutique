/** Category-aware cover and product placeholder images. */

const IMAGES = {
  saree: "/brand/category-saree.jpg",
  lehenga: "/brand/category-lehenga.jpg",
  kurti: "/brand/hero-saree.jpg",
  blouse: "/brand/hero-saree.jpg",
  frock: "/brand/category-girls.jpg",
  default: "/brand/hero-saree.jpg",
} as const;

const REMOTE_PLACEHOLDER_HOSTS = ["images.unsplash.com", "source.unsplash.com"] as const;

function matchSlug(slug: string): keyof typeof IMAGES {
  const s = slug.toLowerCase();
  if (s.includes("saree")) return "saree";
  if (s.includes("lehenga") || s === "bridal" || s === "festive") return "lehenga";
  if (s.includes("kurt") || s.includes("blouse")) return "kurti";
  if (s.includes("frock") || s.includes("girl") || s.includes("birthday") || s.includes("kid"))
    return "frock";
  return "default";
}

function isRemotePlaceholder(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return REMOTE_PLACEHOLDER_HOSTS.some((placeholder) => host.includes(placeholder));
  } catch {
    return false;
  }
}

export function categoryCoverImage(slug: string, imageUrl?: string | null): string {
  const fallback = IMAGES[matchSlug(slug)];
  if (!imageUrl?.trim() || isRemotePlaceholder(imageUrl)) return fallback;
  return imageUrl;
}

export function productPlaceholderImage(
  primaryCategorySlug?: string | null,
  productName?: string | null,
): string {
  if (primaryCategorySlug) {
    return categoryCoverImage(primaryCategorySlug);
  }
  if (productName) {
    const n = productName.toLowerCase();
    if (n.includes("saree")) return IMAGES.saree;
    if (n.includes("lehenga")) return IMAGES.lehenga;
    if (n.includes("kurta") || n.includes("kurti") || n.includes("blouse")) return IMAGES.kurti;
    if (n.includes("frock") || n.includes("girl")) return IMAGES.frock;
  }
  return IMAGES.default;
}

export function normalizeProductImage(
  imageUrl: string | null | undefined,
  primaryCategorySlug?: string | null,
  productName?: string | null,
): string {
  if (!imageUrl?.trim() || isRemotePlaceholder(imageUrl)) {
    return productPlaceholderImage(primaryCategorySlug, productName);
  }
  return imageUrl;
}
