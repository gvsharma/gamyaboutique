"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterestForm } from "@/components/interest/interest-form";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { RelatedProducts } from "@/components/product/related-products";
import { ShareProduct } from "@/components/product/share-product";
import { ROUTES } from "@/constants/routes";
import { CONTACT } from "@/constants/site";
import { useWishlistActions } from "@/hooks/use-wishlist";
import { addToCart } from "@/lib/api/services/cart.service";
import { recordProductView } from "@/lib/api/services/recently-viewed.service";
import { queryKeys } from "@/lib/query/query-keys";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductDetail } from "@/types/product";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=900&q=80";

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const images = [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
  const { has, toggle } = useWishlistActions();
  const inWishlist = has(product.id);
  const queryClient = useQueryClient();
  const [added, setAdded] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
    recordProductView(product.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["recentlyViewed"] });
      })
      .catch(() => undefined);
  }, [product.id, queryClient]);

  const addCartMutation = useMutation({
    mutationFn: () => addToCart(product.id, 1),
    onSuccess: () => {
      setAdded(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      setTimeout(() => setAdded(false), 2000);
    },
  });

  return (
    <>
      <div className="container-premium py-10 lg:py-16">
        <nav className="mb-8 text-sm text-stone">
          <Link href={ROUTES.home} className="link-subtle">Home</Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href={ROUTES.shop} className="link-subtle">Shop</Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-6">
            <ProductImageGallery images={images} productName={product.name} placeholder={PLACEHOLDER} />
            {product.videoUrl && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">Product video</p>
                <video
                  src={product.videoUrl}
                  controls
                  playsInline
                  className="w-full rounded-2xl border border-charcoal/10 bg-charcoal"
                />
              </div>
            )}
          </div>

          <div className="lg:py-4">
            {product.fabric && (
              <span className="chip">{product.fabric.name}{product.print ? ` · ${product.print.name}` : ""}</span>
            )}
            <h1 className="mt-4 font-display text-3xl text-charcoal sm:text-4xl lg:text-[2.75rem]">{product.name}</h1>
            <p className="mt-2 text-sm text-stone">SKU {product.sku}</p>

            {product.lowStock && (
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-maroon">
                Only a few left
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-medium text-maroon">
                {formatPrice(product.effectivePrice, product.currency)}
              </span>
              {product.onOffer && product.compareAtPrice && (
                <span className="text-lg text-stone/80 line-through">
                  {formatPrice(product.compareAtPrice, product.currency)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 text-body">{product.description}</p>
            )}

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag.id} className="chip">{tag.name}</span>
                ))}
              </div>
            )}

            <div className="mt-8 hidden flex-wrap gap-3 lg:flex">
              <Button
                variant="primary"
                size="lg"
                onClick={() => addCartMutation.mutate()}
                disabled={addCartMutation.isPending}
              >
                {added ? "Added to bag" : addCartMutation.isPending ? "Adding…" : "Add to bag"}
              </Button>
              <Button
                variant={inWishlist ? "soft" : "outline"}
                size="lg"
                onClick={() => toggle(product, ROUTES.product(product.id))}
              >
                <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                {inWishlist ? "Saved" : "Save"}
              </Button>
              {shareUrl && <ShareProduct productName={product.name} url={shareUrl} />}
            </div>

            <div className="mt-12 rounded-2xl bg-ivory/80 p-6 sm:p-8">
              <h2 className="font-display text-xl text-charcoal">Express your interest</h2>
              <p className="mt-2 text-body">
                Our stylists will reach out to discuss fit, customization, and availability.
              </p>
              <InterestForm productId={product.id} productName={product.name} />
            </div>
          </div>
        </div>

        <RelatedProducts productId={product.id} />
      </div>

      <a
        href={`https://wa.me/91${CONTACT.phone}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevated transition-transform duration-300 hover:scale-105 lg:bottom-8"
        aria-label="WhatsApp inquiry"
      >
        <MessageCircle className="h-5 w-5" />
      </a>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-charcoal/5 bg-pearl/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Button
            className="flex-1"
            size="lg"
            onClick={() => addCartMutation.mutate()}
            disabled={addCartMutation.isPending}
          >
            {added ? "Added" : "Add to bag"}
          </Button>
          <Button variant="soft" className="shrink-0 px-4" onClick={() => toggle(product, ROUTES.product(product.id))}>
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
