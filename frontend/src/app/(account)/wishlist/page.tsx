"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-burgundy">Wishlist</h1>
      <p className="mt-2 text-stone">
        Saved on this device — {items.length} piece{items.length !== 1 ? "s" : ""}.
      </p>
      <div className="mt-10">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone">Your wishlist is empty.</p>
            <Link href={ROUTES.shop} className="mt-6 inline-block">
              <Button>Browse shop</Button>
            </Link>
          </div>
        ) : (
          <ProductGrid products={items} />
        )}
      </div>
    </div>
  );
}
