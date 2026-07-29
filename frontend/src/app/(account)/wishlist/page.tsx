"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/ui/section-header";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { WishlistInquireBar } from "@/components/wishlist/wishlist-inquire-bar";
import { ROUTES } from "@/constants/routes";
import { fetchWishlist } from "@/lib/api/services/wishlist.service";
import { tokenStorage } from "@/lib/auth/token-storage";
import { queryKeys } from "@/lib/query/query-keys";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function WishlistPage() {
  const setItems = useWishlistStore((s) => s.setItems);
  const items = useWishlistStore((s) => s.items);
  const isLoggedIn = typeof window !== "undefined" && Boolean(tokenStorage.get());

  const { isLoading, isError } = useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: fetchWishlist,
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist().then(setItems).catch(() => undefined);
    }
  }, [isLoggedIn, setItems]);

  if (!isLoggedIn) {
    return (
      <div className="container-premium flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <SectionHeader
          eyebrow="Saved pieces"
          title="Your wishlist"
          description="Sign in to save favourites across all your devices."
        />
        <Link href={`${ROUTES.login}?returnUrl=${encodeURIComponent(ROUTES.wishlist)}`} className="mt-8">
          <Button size="lg">Sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-premium py-12 sm:py-16 lg:py-20">
      <SectionHeader
        align="left"
        eyebrow="Saved pieces"
        title="Your wishlist"
        description={`${items.length} piece${items.length !== 1 ? "s" : ""} curated just for you.`}
        className="mb-10"
      />

      {isLoading && <ProductGridSkeleton count={6} />}
      {isError && <p className="text-maroon">Could not load wishlist.</p>}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="font-display text-xl text-charcoal">Nothing saved yet</p>
          <p className="mt-2 text-body">Tap the heart on any piece you love.</p>
          <Link href={ROUTES.shop} className="mt-8">
            <Button>Explore collection</Button>
          </Link>
        </div>
      )}
      {!isLoading && items.length > 0 && (
        <>
          <WishlistGrid products={items} />
          <WishlistInquireBar products={items} />
        </>
      )}
    </div>
  );
}
