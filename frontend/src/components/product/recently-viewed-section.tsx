"use client";

import { ProductCarousel } from "@/components/home/product-carousel";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function RecentlyViewedSection() {
  const { data: products = [] } = useRecentlyViewed();

  if (products.length === 0) return null;

  return (
    <ProductCarousel
      products={products}
      eyebrow="Continue browsing"
      title="Recently Viewed Items"
    />
  );
}
