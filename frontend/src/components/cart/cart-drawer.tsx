"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CatalogImage } from "@/components/ui/catalog-image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/services/cart.service";
import { formatPrice, cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query/query-keys";

import { normalizeProductImage } from "@/lib/category-images";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: fetchCart,
    enabled: open,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.cart });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      updateCartItem(id, quantity),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: invalidate,
  });

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-charcoal/20 backdrop-blur-sm transition-opacity duration-300 ease-premium",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-pearl shadow-elevated transition-transform duration-500 ease-premium",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-charcoal/5 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-maroon" />
            <h2 className="font-display text-xl text-charcoal">Your bag</h2>
            {cart && cart.itemCount > 0 && (
              <span className="text-sm text-stone">({cart.itemCount})</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone transition-colors hover:bg-ivory hover:text-charcoal"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <p className="text-sm text-stone">Loading…</p>}
          {!isLoading && (cart?.items.length ?? 0) === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-champagne" strokeWidth={1.2} />
              <p className="mt-4 font-display text-lg text-charcoal">Your bag is empty</p>
              <p className="mt-2 text-sm text-stone">Discover pieces crafted for you.</p>
              <Link href={ROUTES.shop} onClick={onClose} className="mt-6">
                <Button variant="primary">Browse collection</Button>
              </Link>
            </div>
          )}
          <ul className="space-y-5">
            {cart?.items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="relative h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-ivory">
                  <CatalogImage
                    src={normalizeProductImage(
                      item.product?.primaryImageUrl,
                      item.product?.primaryCategorySlug,
                      item.product?.name,
                    )}
                    fallbackSrc={normalizeProductImage(
                      null,
                      item.product?.primaryCategorySlug,
                      item.product?.name,
                    )}
                    alt={item.product?.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={ROUTES.product(item.productId)}
                    onClick={onClose}
                    className="truncate font-display text-base text-charcoal hover:text-maroon"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="mt-1 text-price">
                    {item.product
                      ? formatPrice(item.product.effectivePrice, item.product.currency)
                      : "—"}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <button
                      type="button"
                      className="rounded-full border border-charcoal/10 p-1.5 text-stone hover:text-maroon"
                      onClick={() =>
                        updateMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded-full border border-charcoal/10 p-1.5 text-stone hover:text-maroon"
                      onClick={() =>
                        updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-xs text-stone hover:text-maroon"
                      onClick={() => removeMutation.mutate(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {(cart?.items.length ?? 0) > 0 && (
          <div className="border-t border-charcoal/5 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone">Subtotal</span>
              <span className="font-medium text-maroon">
                {formatPrice(cart?.subtotal ?? 0, cart?.currency ?? "INR")}
              </span>
            </div>
            <p className="mt-2 text-xs text-stone">
              Styling inquiries & COD — express interest on each piece.
            </p>
            <Link href={ROUTES.cart} onClick={onClose} className="mt-4 block">
              <Button className="w-full" variant="primary">
                View full bag
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
