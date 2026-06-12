import { create } from "zustand";
import { fetchWishlist } from "@/lib/api/services/wishlist.service";
import type { ProductSummary } from "@/types/product";

interface WishlistState {
  items: ProductSummary[];
  setItems: (items: ProductSummary[]) => void;
  has: (id: string) => boolean;
  sync: () => Promise<void>;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  has: (id) => get().items.some((i) => i.id === id),
  sync: async () => {
    const items = await fetchWishlist();
    set({ items });
  },
  clear: () => set({ items: [] }),
}));
