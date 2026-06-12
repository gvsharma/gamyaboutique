"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { fetchCart, removeCartItem, updateCartItem } from "@/lib/api/services/cart.service";
import { formatPrice } from "@/lib/utils";
import { queryKeys } from "@/lib/query/query-keys";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=600&q=80";

export default function CartPage() {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: fetchCart,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.cart });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => updateCartItem(id, quantity),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeCartItem(id),
    onSuccess: invalidate,
  });

  if (isLoading) {
    return (
      <div className="container-premium py-16">
        <p className="text-stone">Loading cart…</p>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="container-premium py-10 sm:py-12">
      <SectionHeader align="left" eyebrow="Your bag" title="Shopping cart" className="mb-10" />

      {items.length === 0 ? (
        <div className="surface-muted py-16 text-center">
          <p className="text-body">Your cart is empty.</p>
          <Link href={ROUTES.shop} className="mt-6 inline-block">
            <Button>Browse shop</Button>
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">
          {items.map((item) => (
            <div key={item.id} className="surface-card flex gap-4 p-4 sm:p-5">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-ivory">
                <Image
                  src={item.product?.primaryImageUrl ?? PLACEHOLDER}
                  alt={item.product?.name ?? "Product"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={ROUTES.product(item.productId)}
                  className="font-display text-lg text-charcoal transition-colors hover:text-maroon"
                >
                  {item.product?.name ?? "Product"}
                </Link>
                <p className="mt-1 text-sm font-medium text-maroon">
                  {item.product ? formatPrice(item.product.effectivePrice, item.product.currency) : "—"}
                </p>
                <div className="mt-auto flex items-center gap-4 pt-3">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateMutation.mutate({ id: item.id, quantity: Number(e.target.value) })
                    }
                    className="admin-input w-16 !mt-0 text-center"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(item.id)}
                    className="link-subtle text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="surface-card flex items-center justify-between px-5 py-4">
            <span className="text-stone">Subtotal</span>
            <span className="font-display text-xl text-maroon">
              {formatPrice(cart?.subtotal ?? 0, cart?.currency ?? "INR")}
            </span>
          </div>

          <p className="text-center text-xs text-stone">
            Checkout coming soon — use Express your interest on product pages for styling inquiries.
          </p>
        </div>
      )}
    </div>
  );
}
