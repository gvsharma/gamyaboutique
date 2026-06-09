export const ROUTES = {
  home: "/",
  shop: "/shop",
  about: "/about",
  contact: "/contact",
  login: "/login",
  wishlist: "/wishlist",
  category: (slug: string) => `/category/${slug}`,
  product: (id: string) => `/products/${id}`,
  admin: {
    home: "/admin",
    products: "/admin/products",
    productNew: "/admin/products/new",
    productEdit: (id: string) => `/admin/products/${id}/edit`,
    categories: "/admin/categories",
  },
} as const;
