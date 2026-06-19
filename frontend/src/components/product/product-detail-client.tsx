"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Ruler, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImageGallery } from "@/components/product/product-image-gallery";
import { ProductReviews, ProductReviewsInline } from "@/components/product/product-reviews";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { RelatedProducts } from "@/components/product/related-products";
import { ShareProduct } from "@/components/product/share-product";
import { PRODUCT_SIZES, SizeChartModal } from "@/components/product/size-chart-modal";
import { ROUTES } from "@/constants/routes";
import { CONTACT } from "@/constants/site";
import { useWishlistActions } from "@/hooks/use-wishlist";
import { addToCart } from "@/lib/api/services/cart.service";
import { recordProductView } from "@/lib/api/services/recently-viewed.service";
import { queryKeys } from "@/lib/query/query-keys";
import { formatPrice, cn } from "@/lib/utils";
import { productPlaceholderImage } from "@/lib/category-images";
import type { ProductDetail } from "@/types/product";

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const images = [...product.images].sort((a, b) => a.displayOrder - b.displayOrder);
  const { has, toggle } = useWishlistActions();
  const inWishlist = has(product.id);
  const queryClient = useQueryClient();
  const [added, setAdded] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
    recordProductView(product.id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["recentlyViewed"] });
      })
      .catch(() => undefined);
  }, [product.id, queryClient]);

  const addCartMutation = useMutation({
    mutationFn: () => addToCart(product.id, quantity),
    onSuccess: () => {
      setAdded(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      setTimeout(() => setAdded(false), 2000);
    },
  });

  const handleAddToCart = () => {
    addCartMutation.mutate();
  };

  const addToCartLabel = added
    ? "Added to bag"
    : addCartMutation.isPending
      ? "Adding…"
      : "Add to bag";

  return (
    <>
      <div className="container-premium py-8 lg:py-14">
        <nav className="mb-6 text-sm text-stone lg:mb-8">
          <Link href={ROUTES.home} className="link-subtle">
            Home
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <Link href={ROUTES.shop} className="link-subtle">
            Shop
          </Link>
          <span className="mx-2 opacity-40">/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery
              images={images}
              productName={product.name}
              placeholder={productPlaceholderImage(product.primaryCategorySlug, product.name)}
            />
            {product.videoUrl && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">
                  Product video
                </p>
                <video
                  src={product.videoUrl}
                  controls
                  playsInline
                  className="w-full rounded-2xl border border-charcoal/10 bg-charcoal"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="space-y-1">
              {product.fabric && (
                <span className="chip">
                  {product.fabric.name}
                  {product.print ? ` · ${product.print.name}` : ""}
                </span>
              )}
              <h1 className="mt-3 font-display text-3xl leading-tight text-charcoal sm:text-4xl lg:text-[2.5rem]">
                {product.name}
              </h1>
              <p className="text-sm text-stone">SKU {product.sku}</p>
            </div>

            <div className="mt-4">
              <ProductReviewsInline />
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="font-display text-3xl text-maroon">
                {formatPrice(product.effectivePrice, product.currency)}
              </span>
              {product.onOffer && product.compareAtPrice && (
                <>
                  <span className="text-lg text-stone/70 line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                  <span className="rounded-full bg-maroon/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-maroon">
                    Sale
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-stone/80">
              Taxes included. Shipping calculated at checkout.
            </p>

            {product.lowStock && (
              <p className="mt-3 text-xs font-medium uppercase tracking-wider text-maroon">
                Only a few left — order soon
              </p>
            )}

            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone">Size</p>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-maroon underline-offset-2 transition-colors hover:text-maroon-deep hover:underline"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  Size chart
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[3rem] rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                      selectedSize === size
                        ? "border-maroon bg-maroon text-pearl shadow-glow"
                        : "border-charcoal/12 bg-pearl text-charcoal hover:border-maroon/30 hover:bg-ivory",
                    )}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-stone/70">Select a size for the best fit reference</p>
              )}
            </div>

            <div className="mt-8">
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            <div className="mt-8 hidden flex-col gap-3 sm:flex-row lg:flex">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 sm:min-w-[12rem]"
                onClick={handleAddToCart}
                disabled={addCartMutation.isPending}
              >
                <ShoppingBag className="h-4 w-4" />
                {addToCartLabel}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 opacity-60 sm:min-w-[10rem]"
                disabled
                title="Buy now — coming soon"
              >
                Buy now
                <span className="text-[10px] font-normal uppercase tracking-wider opacity-80">
                  Soon
                </span>
              </Button>
              <Button
                variant={inWishlist ? "soft" : "outline"}
                size="lg"
                className="shrink-0 px-5"
                onClick={() => toggle(product, ROUTES.product(product.id))}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
              </Button>
            </div>

            {shareUrl && (
              <div className="mt-8 border-t border-charcoal/8 pt-8">
                <ShareProduct productName={product.name} url={shareUrl} />
              </div>
            )}

            {product.description && (
              <div className="mt-8 border-t border-charcoal/8 pt-8">
                <p className="text-eyebrow">About this piece</p>
                <p className="mt-3 text-body leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag.id} className="chip">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <ProductReviews className="mt-16 lg:mt-20" />
        <RelatedProducts productId={product.id} />
      </div>

      <SizeChartModal
        open={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
        productName={product.name}
      />

      <a
        href={`https://wa.me/91${CONTACT.phone}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[5.5rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevated transition-transform duration-300 hover:scale-105 lg:bottom-8"
        aria-label="WhatsApp inquiry"
      >
        <MessageCircle className="h-5 w-5" />
      </a>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-charcoal/8 bg-pearl/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="min-w-0 shrink">
            <p className="truncate text-xs text-stone">{product.name}</p>
            <p className="font-display text-lg text-maroon">
              {formatPrice(product.effectivePrice, product.currency)}
            </p>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              className="hidden min-[400px]:flex"
            />
            <Button
              className="min-w-[7.5rem] flex-1 sm:flex-none"
              size="lg"
              onClick={handleAddToCart}
              disabled={addCartMutation.isPending}
            >
              {added ? "Added" : "Add to bag"}
            </Button>
            <Button
              variant={inWishlist ? "soft" : "outline"}
              className="shrink-0 px-3.5"
              onClick={() => toggle(product, ROUTES.product(product.id))}
              aria-label={inWishlist ? "Saved" : "Save"}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-[4.5rem] lg:hidden" aria-hidden />
    </>
  );
}
