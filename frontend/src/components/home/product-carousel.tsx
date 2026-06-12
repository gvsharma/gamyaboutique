"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { SectionHeader } from "@/components/ui/section-header";
import type { ProductSummary } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: ProductSummary[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ProductCarousel({
  products,
  eyebrow = "Trending",
  title = "Most loved right now",
  description,
  className,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className={cn("container-premium py-16 sm:py-20", className)}>
      <div className="flex items-end justify-between gap-4">
        <SectionHeader align="left" eyebrow={eyebrow} title={title} description={description} />
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="rounded-full border border-charcoal/10 p-2.5 text-stone transition-colors hover:border-maroon/20 hover:text-maroon"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="rounded-full border border-charcoal/10 p-2.5 text-stone transition-colors hover:border-maroon/20 hover:text-maroon"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-none sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="w-[72vw] shrink-0 snap-start sm:w-[280px] lg:w-[300px]"
          >
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
