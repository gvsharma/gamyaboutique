"use client";

import { useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";

interface ShareProductProps {
  productName: string;
  url: string;
  className?: string;
}

export function ShareProduct({ productName, url, className }: ShareProductProps) {
  const [copied, setCopied] = useState(false);
  const shareText = `${productName} — ${SITE_NAME}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: shareText, text: shareText, url });
    } catch {
      /* user cancelled or unsupported */
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone">Share</p>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#1a8f4a] transition-colors hover:bg-[#25D366]/15"
        >
          <Share2 className="h-4 w-4" />
          WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 px-4 py-2 text-sm text-charcoal transition-colors hover:border-maroon/20 hover:bg-ivory/60"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy link
            </>
          )}
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 px-4 py-2 text-sm text-charcoal transition-colors hover:border-maroon/20 hover:bg-ivory/60"
          >
            <Link2 className="h-4 w-4" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}
