export const API = {
  products: "/products",
  product: (id: string) => `/products/${id}`,
  productInterest: (id: string) => `/products/${id}/interest`,
  productSearch: "/products/search",
  categoriesTree: "/categories/tree",
  catalogCategories: "/catalog/categories",
  categoryProducts: (slug: string) => `/catalog/categories/${slug}/products`,
  authLogin: "/auth/login",
  authMe: "/auth/me",
} as const;
