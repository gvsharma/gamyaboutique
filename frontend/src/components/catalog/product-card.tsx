"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, ShoppingBag } from "lucide-react";
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
      <Link href={ROUTES.product(product.id)} className="product-image-wrap block rounded-none">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

        {product.onOffer && (
          <span className="absolute left-3 top-3 bg-charcoal px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-pearl">
            Sale
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-charcoal/0 pb-6 transition-all duration-500 ease-premium group-hover:bg-charcoal/25">
          <div className="flex translate-y-4 gap-2 opacity-0 transition-all duration-400 ease-premium group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 bg-pearl px-4 py-2 text-xs font-medium uppercase tracking-wider text-charcoal">
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              View
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addCartMutation.mutate();
              }}
              className="inline-flex items-center gap-1.5 bg-charcoal px-4 py-2 text-xs font-medium uppercase tracking-wider text-pearl transition-colors hover:bg-maroon"
              aria-label="Add to bag"
            >
              <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
              Add
            </button>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggle(product, ROUTES.product(product.id))}
        className={cn(
          "absolute right-3 top-3 z-10 rounded-full bg-pearl/90 p-2 shadow-soft backdrop-blur-sm transition-all duration-300",
          inWishlist ? "text-maroon" : "text-stone opacity-0 group-hover:opacity-100 hover:text-maroon",
        )}
        aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current opacity-100")} strokeWidth={1.5} />
      </button>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-4">
        {product.fabric && <span className="chip w-fit">{product.fabric.name}</span>}
        <Link href={ROUTES.product(product.id)}>
          <h3 className="font-display text-product-title text-charcoal transition-colors hover:text-maroon line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-price">{formatPrice(product.effectivePrice, product.currency)}</span>
          {product.onOffer && product.compareAtPrice && (
            <span className="text-xs text-stone/70 line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
