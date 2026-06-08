import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@/types/product";

interface WishlistState {
  items: ProductSummary[];
  add: (product: ProductSummary) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) =>
        set((s) =>
          s.items.some((i) => i.id === product.id)
            ? s
            : { items: [...s.items, product] },
        ),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "gamya-wishlist" },
  ),
);
