"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "@/lib/api/services/wishlist.service";
import { tokenStorage } from "@/lib/auth/token-storage";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductSummary } from "@/types/product";

export function useWishlistActions() {
  const router = useRouter();
  const { items, setItems, has, sync } = useWishlistStore();

  useEffect(() => {
    if (tokenStorage.get()) {
      sync().catch(() => undefined);
    }
  }, [sync]);

  const toggle = useCallback(
    async (product: ProductSummary, returnUrl?: string) => {
      if (!tokenStorage.get()) {
        router.push(
          `${ROUTES.login}?returnUrl=${encodeURIComponent(returnUrl ?? ROUTES.wishlist)}`,
        );
        return;
      }
      if (has(product.id)) {
        const updated = await removeFromWishlist(product.id);
        setItems(updated);
      } else {
        const updated = await addToWishlist(product.id);
        setItems(updated);
      }
    },
    [has, router, setItems],
  );

  return { items, has, toggle, refresh: () => fetchWishlist().then(setItems) };
}
