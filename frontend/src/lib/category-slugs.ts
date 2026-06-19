/** Maps marketing/nav slugs to live API catalog slugs. */
const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  // Legacy girls / kids routes → girls taxonomy
  "kids-ethnic": "girls",
  "kids-collection": "girls",
  "girls-collection": "girls",
  frocks: "girls-kurtas",
  "girls-lehenga-sets": "girls-lehengas",
  "girls-festival-wear": "girls-kurtas",
  "birthday-specials": "girls-kurtas",
  "mom-daughter-sets": "girls-lehengas",
  // Legacy marketing saree sub-types → women sarees
  "silk-sarees": "sarees",
  "cotton-sarees": "sarees",
  "party-wear-sarees": "sarees",
  "wedding-sarees": "sarees",
  "daily-wear-sarees": "sarees",
  // Legacy lehenga marketing → women or girls
  "bridal-lehengas": "lehengas",
  "party-wear-lehengas": "lehengas",
  "festive-lehengas": "lehengas",
  "girls-lehengas": "girls-lehengas",
};

const DISPLAY_NAMES: Record<string, string> = {
  women: "Women",
  girls: "Girls",
  sarees: "Sarees",
  kurtas: "Kurtas",
  lehengas: "Lehengas",
  blouses: "Blouses",
  "girls-kurtas": "Girls Kurtas",
  "girls-lehengas": "Girls Lehengas",
  "kids-ethnic": "Girls Collection",
};

export function resolveCatalogSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return CATEGORY_SLUG_ALIASES[normalized] ?? normalized;
}

/** Human-readable label for nav slugs when API has no matching category row. */
export function displayCategoryName(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  if (DISPLAY_NAMES[normalized]) return DISPLAY_NAMES[normalized];
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
