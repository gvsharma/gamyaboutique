/** Category-aware cover and product placeholder images (Unsplash). */

const IMAGES = {
  saree: "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=1200&q=80",
  lehenga: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80",
  kurti: "https://images.unsplash.com/photo-1617627143750-d86bc21e3273?w=1200&q=80",
  blouse: "https://images.unsplash.com/photo-1572804013309-59a23b2e4c1f?w=1200&q=80",
  frock: "https://images.unsplash.com/photo-1515488042361-ee00e8170dc8?w=1200&q=80",
  sherwani: "https://images.unsplash.com/photo-1620799140408-8747d1d90e59?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1200&q=80",
} as const;

function matchSlug(slug: string): keyof typeof IMAGES {
  const s = slug.toLowerCase();
  if (s.includes("saree")) return "saree";
  if (s.includes("lehenga") || s === "bridal") return "lehenga";
  if (s.includes("kurt")) return "kurti";
  if (s.includes("blouse")) return "blouse";
  if (s.includes("frock") || s.includes("girl") || s.includes("kid") || s.includes("birthday")) return "frock";
  if (s.includes("sherwani") || s === "men") return "sherwani";
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
    return categoryCoverImage(primaryCategorySlug).replace("w=1200", "w=800");
  }
  if (productName) {
    const n = productName.toLowerCase();
    if (n.includes("saree")) return IMAGES.saree.replace("w=1200", "w=800");
    if (n.includes("lehenga")) return IMAGES.lehenga.replace("w=1200", "w=800");
    if (n.includes("kurta") || n.includes("kurti")) return IMAGES.kurti.replace("w=1200", "w=800");
    if (n.includes("blouse")) return IMAGES.blouse.replace("w=1200", "w=800");
    if (n.includes("frock") || n.includes("girl")) return IMAGES.frock.replace("w=1200", "w=800");
    if (n.includes("sherwani")) return IMAGES.sherwani.replace("w=1200", "w=800");
  }
  return IMAGES.default.replace("w=1200", "w=800");
}
