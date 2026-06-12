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
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { ProductSummary } from "@/types/product";

export function useWishlistActions() {
  const router = useRouter();
  const { items, setItems, has, sync } = useWishlistStore();

  useEffect(() => {
    if (!tokenStorage.get()) return;
    sync().catch(() => {
      useAuthStore.getState().logout();
      useWishlistStore.getState().clear();
    });
  }, [sync]);

  const toggle = useCallback(
    async (product: ProductSummary, returnUrl?: string) => {
      const loginUrl = `${ROUTES.login}?returnUrl=${encodeURIComponent(returnUrl ?? ROUTES.wishlist)}`;
      if (!tokenStorage.get()) {
        router.push(loginUrl);
        return;
      }
      try {
        if (has(product.id)) {
          const updated = await removeFromWishlist(product.id);
          setItems(updated);
        } else {
          const updated = await addToWishlist(product.id);
          setItems(updated);
        }
      } catch {
        router.push(loginUrl);
      }
    },
    [has, router, setItems],
  );

  return { items, has, toggle, refresh: () => fetchWishlist().then(setItems) };
}
