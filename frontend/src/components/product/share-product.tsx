"use client";

import { Share2 } from "lucide-react";
import { SITE_NAME } from "@/constants/site";

interface ShareProductProps {
  productName: string;
  url: string;
}

export function ShareProduct({ productName, url }: ShareProductProps) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${productName} — ${SITE_NAME}\n${url}`)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 px-4 py-2 text-sm text-maroon transition-colors hover:border-maroon/20 hover:bg-ivory/60"
    >
      <Share2 className="h-4 w-4" />
      Share on WhatsApp
    </a>
  );
}
