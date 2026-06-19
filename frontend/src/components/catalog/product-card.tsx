"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, ShoppingBag } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useWishlistActions } from "@/hooks/use-wishlist";
import { addToCart } from "@/lib/api/services/cart.service";
import { queryKeys } from "@/lib/query/query-keys";
import { CatalogImage } from "@/components/ui/catalog-image";
import { normalizeProductImage } from "@/lib/category-images";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

const STAGGER = ["", "stagger-1", "stagger-2", "stagger-3", "stagger-4"] as const;

interface ProductCardProps {
  product: ProductSummary;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const { has, toggle } = useWishlistActions();
  const inWishlist = has(product.id);
  const imageUrl = normalizeProductImage(
    product.primaryImageUrl,
    product.primaryCategorySlug,
    product.name,
  );
  const fallbackImage = normalizeProductImage(null, product.primaryCategorySlug, product.name);
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
      <Link href={ROUTES.product(product.id)} className="product-image-wrap block">
        <CatalogImage
          src={imageUrl}
          fallbackSrc={fallbackImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="lazy"
        />

        {product.onOffer && (
          <span className="badge-editorial absolute bottom-3 left-3">Sale</span>
        )}

        <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/10" />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            addCartMutation.mutate();
          }}
          className="absolute bottom-3 right-3 translate-y-2 bg-charcoal p-2.5 text-pearl opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-maroon"
          aria-label="Add to bag"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </Link>

      <button
        type="button"
        onClick={() => toggle(product, ROUTES.product(product.id))}
        className={cn(
          "absolute right-3 top-3 z-10 p-1.5 transition-all duration-300",
          inWishlist ? "text-maroon" : "text-charcoal/40 opacity-0 group-hover:opacity-100 hover:text-maroon",
        )}
        aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
      >
        <Heart className={cn("h-4 w-4", inWishlist && "fill-current opacity-100")} strokeWidth={1.5} />
      </button>

      <div className="flex flex-1 flex-col gap-0.5 pt-3">
        <Link href={ROUTES.product(product.id)}>
          <h3 className="text-[13px] font-medium uppercase tracking-[0.06em] text-charcoal transition-colors hover:text-maroon line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-medium tracking-tight text-charcoal">
            {formatPrice(product.effectivePrice, product.currency)}
          </span>
          {product.onOffer && product.compareAtPrice && (
            <span className="text-xs text-stone/60 line-through">
              {formatPrice(product.compareAtPrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
