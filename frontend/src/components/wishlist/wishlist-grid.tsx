"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useWishlistActions } from "@/hooks/use-wishlist";
import { moveWishlistToCart } from "@/lib/api/services/wishlist.service";
import { queryKeys } from "@/lib/query/query-keys";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=600&q=80";

/** Pinterest-style masonry using CSS columns */
export function WishlistGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 sm:gap-5 lg:columns-4 lg:gap-6">
      {products.map((product, index) => (
        <WishlistPin key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

function WishlistPin({ product, index }: { product: ProductSummary; index: number }) {
  const { toggle } = useWishlistActions();
  const queryClient = useQueryClient();
  const aspect = index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/5]";

  const addCartMutation = useMutation({
    mutationFn: () => moveWishlistToCart(product.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });

  return (
    <article className="mb-4 break-inside-avoid sm:mb-5 lg:mb-6 animate-fade-up">
      <div className="group relative overflow-hidden rounded-2xl bg-ivory">
        <Link href={ROUTES.product(product.id)} className={cn("relative block w-full", aspect)}>
          <Image
            src={product.primaryImageUrl ?? PLACEHOLDER}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </Link>

        <button
          type="button"
          onClick={() => toggle(product, ROUTES.wishlist)}
          className="absolute right-3 top-3 rounded-full bg-pearl/95 p-2 text-maroon shadow-soft backdrop-blur-sm"
          aria-label="Remove from wishlist"
        >
          <Heart className="h-4 w-4 fill-current" strokeWidth={1.5} />
        </button>

        <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 ease-premium group-hover:translate-y-0">
          <Button
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => addCartMutation.mutate()}
            disabled={addCartMutation.isPending}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to bag
          </Button>
        </div>
      </div>

      <div className="mt-3 px-0.5">
        {product.fabric && <span className="chip">{product.fabric.name}</span>}
        <Link href={ROUTES.product(product.id)}>
          <h3 className="mt-2 font-display text-base leading-snug text-charcoal transition-colors hover:text-maroon line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-price">{formatPrice(product.effectivePrice, product.currency)}</p>
      </div>
    </article>
  );
}
