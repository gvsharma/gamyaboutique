"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  className?: string;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            iconClass,
            i < rating ? "fill-gold text-gold" : "fill-transparent text-charcoal/20",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ProductReviewsInline() {
  return (
    <div className="flex items-center gap-2">
      <StarRating rating={0} />
      <span className="text-sm text-stone">No reviews yet</span>
    </div>
  );
}

export function ProductReviews({ className }: ProductReviewsProps) {
  return (
    <section className={cn("border-t border-charcoal/8 pt-10", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">Customer reviews</p>
          <h2 className="mt-2 font-display text-2xl text-charcoal">Reviews</h2>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-charcoal/8 bg-warm/50 px-4 py-3">
          <StarRating rating={0} size="md" />
          <div>
            <p className="text-sm font-medium text-charcoal">No reviews yet</p>
            <p className="text-xs text-stone">Be the first to share your experience</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-charcoal/12 bg-ivory/50 px-6 py-10 text-center">
        <StarRating rating={0} size="md" />
        <p className="mt-4 font-display text-lg text-charcoal">No reviews yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-stone">
          Reviews will appear here once customers share their feedback. This section is ready for
          future review integration.
        </p>
      </div>
    </section>
  );
}
