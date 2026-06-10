"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/site";
import { fetchCart } from "@/lib/api/services/cart.service";
import { tokenStorage } from "@/lib/auth/token-storage";
import { queryKeys } from "@/lib/query/query-keys";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const navLinks = [
  { href: ROUTES.shop, label: "Shop" },
  { href: ROUTES.category("sarees"), label: "Sarees" },
  { href: ROUTES.category("lehengas"), label: "Lehengas" },
  { href: ROUTES.category("bridal"), label: "Bridal" },
  { href: ROUTES.about, label: "Story" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);

  const { data: cart } = useQuery({
    queryKey: queryKeys.cart,
    queryFn: fetchCart,
    staleTime: 30_000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cartCount = cart?.itemCount ?? 0;
  const accountHref = user || tokenStorage.get() ? ROUTES.account : ROUTES.login;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 ease-premium",
          scrolled
            ? "border-b border-charcoal/5 bg-pearl/90 py-0 shadow-soft backdrop-blur-xl"
            : "border-b border-transparent bg-pearl/70 py-1 backdrop-blur-md",
        )}
      >
        <div
          className={cn(
            "container-premium flex items-center justify-between transition-all duration-500 ease-premium",
            scrolled ? "h-14" : "h-16",
          )}
        >
          <Link
            href={ROUTES.home}
            className="font-display text-[1.35rem] tracking-tight text-charcoal transition-colors hover:text-maroon sm:text-2xl"
          >
            {SITE_NAME}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="link-subtle text-sm">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href={`${ROUTES.shop}?focus=search`}
              className="rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-ivory hover:text-maroon"
              aria-label="Search"
            >
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
            </Link>
            <Link
              href={ROUTES.wishlist}
              className="relative rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-ivory hover:text-maroon"
              aria-label="Wishlist"
            >
              <Heart className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[9px] font-medium text-pearl">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-ivory hover:text-maroon"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[9px] font-medium text-pearl">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href={accountHref}
              className="hidden rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-ivory hover:text-maroon sm:block"
              aria-label="Account"
            >
              <User className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className="rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-ivory lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[80] lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-charcoal/25 backdrop-blur-sm transition-opacity duration-400 ease-premium",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <nav
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-pearl px-6 py-8 shadow-elevated transition-transform duration-500 ease-premium",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-xl text-charcoal">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-stone hover:bg-ivory"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ul className="mt-10 flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl px-3 py-3 font-display text-lg text-charcoal transition-colors hover:bg-ivory hover:text-maroon"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-4 border-t border-charcoal/5 pt-4">
              <Link
                href={accountHref}
                className="block rounded-xl px-3 py-3 text-sm text-maroon"
                onClick={() => setOpen(false)}
              >
                Account
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
