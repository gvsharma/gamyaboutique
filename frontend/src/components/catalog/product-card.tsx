"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useWishlistActions } from "@/hooks/use-wishlist";
import { addToCart } from "@/lib/api/services/cart.service";
import { queryKeys } from "@/lib/query/query-keys";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=600&q=80";

const STAGGER = ["", "stagger-1", "stagger-2", "stagger-3", "stagger-4"] as const;

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const { has, toggle } = useWishlistActions();
  const inWishlist = has(product.id);
  const imageUrl = product.primaryImageUrl ?? PLACEHOLDER;
  const queryClient = useQueryClient();

  const addCartMutation = useMutation({
    mutationFn: () => addToCart(product.id, 1),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });

  return (
    <article
      className={cn(
        "group relative flex flex-col animate-fade-up",
        STAGGER[Math.min(index, 4)],
        className,
      )}
    >
      <Link href={ROUTES.product(product.id)} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-ivory">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.onOffer && (
          <span className="absolute left-3 top-3 rounded-full bg-pearl/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-maroon shadow-soft backdrop-blur-sm">
            Offer
          </span>
        )}

        <div className="absolute bottom-3 right-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 ease-premium group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addCartMutation.mutate();
            }}
            className="rounded-full bg-pearl/95 p-2.5 text-charcoal shadow-soft backdrop-blur-sm transition-colors hover:text-maroon"
            aria-label="Add to bag"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggle(product, ROUTES.product(product.id))}
        className={cn(
          "absolute right-3 top-3 rounded-full bg-pearl/90 p-2.5 shadow-soft backdrop-blur-sm transition-all duration-300",
          inWishlist ? "text-maroon" : "text-stone hover:text-maroon",
        )}
        aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} strokeWidth={1.5} />
      </button>

      <div className="flex flex-1 flex-col gap-1.5 px-1 pt-4">
        {product.fabric && <span className="chip w-fit">{product.fabric.name}</span>}
        <Link href={ROUTES.product(product.id)}>
          <h3 className="font-display text-product-title text-charcoal transition-colors hover:text-maroon line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-price">{formatPrice(product.effectivePrice, product.currency)}</span>
          {product.onOffer && product.compareAtPrice && (
            <span className="text-xs text-stone/80 line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
