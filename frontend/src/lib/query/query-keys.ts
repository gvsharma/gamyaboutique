export const queryKeys = {
  products: (params?: Record<string, unknown>) => ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  categories: ["categories"] as const,
  categoryTree: ["categoryTree"] as const,
  categoryProducts: (slug: string, page?: number) =>
    ["categoryProducts", slug, page] as const,
  collectionProducts: (slug: string, page?: number) =>
    ["collectionProducts", slug, page] as const,
  me: ["me"] as const,
  cart: ["cart"] as const,
  wishlist: ["wishlist"] as const,
  recentlyViewed: () => ["recentlyViewed"] as const,
};
