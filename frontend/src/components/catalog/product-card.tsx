"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";
import { useWishlistStore } from "@/stores/wishlist-store";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=600&q=80";

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { has, add, remove } = useWishlistStore();
  const inWishlist = has(product.id);
  const imageUrl = product.primaryImageUrl ?? PLACEHOLDER;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm bg-white shadow-card transition-shadow hover:shadow-elevated",
        className,
      )}
    >
      <Link href={ROUTES.product(product.id)} className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.onOffer && (
          <span className="absolute left-3 top-3 bg-burgundy px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cream">
            Offer
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => (inWishlist ? remove(product.id) : add(product))}
        className={cn(
          "absolute right-3 top-3 rounded-full bg-cream/90 p-2 shadow-sm backdrop-blur transition-colors",
          inWishlist ? "text-burgundy" : "text-stone hover:text-burgundy",
        )}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.fabric && (
          <p className="text-[10px] uppercase tracking-widest text-gold-muted">
            {product.fabric.name}
          </p>
        )}
        <Link href={ROUTES.product(product.id)}>
          <h3 className="font-display text-lg leading-snug text-charcoal group-hover:text-burgundy">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-sm font-medium text-burgundy">
            {formatPrice(product.effectivePrice, product.currency)}
          </span>
          {product.onOffer && product.compareAtPrice && (
            <span className="text-xs text-stone line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
