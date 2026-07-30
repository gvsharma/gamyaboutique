"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { wishlistWhatsAppHref, WHATSAPP_BRAND_COLOR } from "@/lib/whatsapp";
import type { ProductSummary } from "@/types/product";

export function WishlistInquireBar({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12 rounded-2xl border border-charcoal/8 bg-ivory/50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-eyebrow text-maroon">Personal styling</p>
        <h2 className="mt-2 font-display text-xl text-charcoal">
          Need help choosing from your saved pieces?
        </h2>
        <p className="mt-2 text-sm text-stone">
          Message our stylist with your wishlist — we&apos;ll suggest sizes, pairings, and custom options.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 sm:mt-0 sm:shrink-0">
        <a
          href={wishlistWhatsAppHref(products)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: WHATSAPP_BRAND_COLOR }}
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp stylist
        </a>
        <Link href={ROUTES.contact}>
          <Button variant="outline">Book consultation</Button>
        </Link>
      </div>
    </div>
  );
}
