"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterestForm } from "@/components/interest/interest-form";
import { ROUTES } from "@/constants/routes";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/product";
import { useWishlistStore } from "@/stores/wishlist-store";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=900&q=80";

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const images =
    product.images.length > 0
      ? product.images.sort((a, b) => a.displayOrder - b.displayOrder)
      : [{ id: "0", url: product.primaryImageUrl ?? PLACEHOLDER, altText: product.name, displayOrder: 0, primary: true }];

  const [activeIndex, setActiveIndex] = useState(0);
  const { has, add, remove } = useWishlistStore();
  const inWishlist = has(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <nav className="mb-8 text-sm text-stone">
        <Link href={ROUTES.home} className="hover:text-burgundy">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={ROUTES.shop} className="hover:text-burgundy">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-ivory">
            <Image
              src={images[activeIndex]?.url ?? PLACEHOLDER}
              alt={images[activeIndex]?.altText ?? product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative h-20 w-16 shrink-0 overflow-hidden rounded-sm border-2",
                    i === activeIndex ? "border-burgundy" : "border-transparent",
                  )}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.fabric && (
            <p className="text-xs uppercase tracking-[0.2em] text-gold-muted">
              {product.fabric.name}
              {product.print ? ` · ${product.print.name}` : ""}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl text-charcoal sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-stone">SKU {product.sku}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-medium text-burgundy">
              {formatPrice(product.effectivePrice, product.currency)}
            </span>
            {product.onOffer && product.compareAtPrice && (
              <span className="text-lg text-stone line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 leading-relaxed text-stone">{product.description}</p>
          )}

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-burgundy/20 px-3 py-1 text-xs text-burgundy"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              variant={inWishlist ? "outline" : "secondary"}
              onClick={() => (inWishlist ? remove(product.id) : add(product))}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
              {inWishlist ? "In wishlist" : "Save to wishlist"}
            </Button>
          </div>

          <div className="mt-12 rounded-sm border border-burgundy/15 bg-ivory/50 p-6">
            <h2 className="font-display text-xl text-burgundy">Express your interest</h2>
            <p className="mt-2 text-sm text-stone">
              Our stylists will reach out to discuss fit, customization, and availability.
            </p>
            <InterestForm productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
