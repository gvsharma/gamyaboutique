import { CONTACT, whatsappHref } from "@/constants/site";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

export interface ProductWhatsAppContext {
  id: string;
  name: string;
  price?: number;
  currency?: string;
  size?: string | null;
  color?: string | null;
  productUrl?: string;
}

export function productWhatsAppMessage(ctx: ProductWhatsAppContext): string {
  const lines = [
    "Hello Gamya Couture! I'd like to enquire about:",
    ctx.name,
  ];
  if (ctx.price != null && ctx.currency) {
    lines.push(`Price: ${formatPrice(ctx.price, ctx.currency)}`);
  }
  if (ctx.size) lines.push(`Size: ${ctx.size}`);
  if (ctx.color) lines.push(`Color: ${ctx.color}`);
  const url = ctx.productUrl ?? absoluteProductUrl(ctx.id);
  lines.push(url);
  return lines.join("\n");
}

export function productWhatsAppHref(ctx: ProductWhatsAppContext): string {
  return whatsappHref(productWhatsAppMessage(ctx));
}

export function wishlistWhatsAppMessage(products: ProductSummary[]): string {
  const lines = [
    "Hello Gamya Couture! I saved these pieces and would like styling advice:",
  ];
  products.slice(0, 12).forEach((product, index) => {
    lines.push(
      `${index + 1}. ${product.name} — ${formatPrice(product.effectivePrice, product.currency)}`,
    );
  });
  if (products.length > 12) {
    lines.push(`…and ${products.length - 12} more on my wishlist.`);
  }
  return lines.join("\n");
}

export function wishlistWhatsAppHref(products: ProductSummary[]): string {
  return whatsappHref(wishlistWhatsAppMessage(products));
}

/** @deprecated Use whatsappHref from @/constants/site */
export function whatsAppUrl(message: string): string {
  return whatsappHref(message);
}

export function whatsAppInterestMessage(productName: string, customerName?: string | null): string {
  const name = customerName?.trim() || "there";
  return `Hi ${name}, regarding your interest in "${productName}" at Gamya Couture —`;
}

function absoluteProductUrl(productId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${ROUTES.product(productId)}`;
  }
  return ROUTES.product(productId);
}

export const WHATSAPP_BRAND_COLOR = "#25D366";
