export const ROUTES = {
  home: "/",
  shop: "/shop",
  about: "/about",
  contact: "/contact",
  login: "/login",
  wishlist: "/wishlist",
  category: (slug: string) => `/category/${slug}`,
  product: (id: string) => `/products/${id}`,
} as const;
