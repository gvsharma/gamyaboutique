/** Category-aware cover and product placeholder images. */

const IMAGES = {
  saree: "/brand/category-saree.jpg",
  lehenga: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80",
  kurti: "/brand/hero-saree.jpg",
  blouse: "/brand/hero-saree.jpg",
  frock: "/brand/hero-saree.jpg",
  default: "/brand/hero-saree.jpg",
} as const;

function matchSlug(slug: string): keyof typeof IMAGES {
  const s = slug.toLowerCase();
  if (s.includes("saree")) return "saree";
  if (s.includes("lehenga") || s === "bridal") return "lehenga";
  if (s.includes("kurt") || s.includes("blouse")) return "kurti";
  if (s.includes("frock") || s.includes("girl") || s.includes("birthday")) return "frock";
  return "default";
}

export function categoryCoverImage(slug: string, imageUrl?: string | null): string {
  if (imageUrl?.trim()) return imageUrl;
  return IMAGES[matchSlug(slug)];
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
