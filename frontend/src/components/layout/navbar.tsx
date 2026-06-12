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
    const onScroll = () => setScrolled(window.scrollY > 12);
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
      {/* Announcement strip */}
      <div className="hidden border-b border-charcoal/5 bg-warm py-2 text-center sm:block">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone">
          Free styling consultation ·{" "}
          <Link href={ROUTES.contact} className="text-maroon transition-colors hover:text-maroon-hover">
            Book now
          </Link>
        </p>
      </div>

      <header
        className={cn(
          "relative sticky top-0 z-50 transition-all duration-500 ease-premium",
          scrolled
            ? "border-b border-charcoal/5 bg-pearl/95 shadow-soft backdrop-blur-xl"
            : "border-b border-charcoal/5 bg-pearl/80 backdrop-blur-md",
        )}
      >
        <div className="container-premium flex h-14 items-center justify-between lg:h-16">
          {/* Left nav — desktop */}
          <nav className="hidden flex-1 items-center gap-7 lg:flex">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-subtle text-[13px] tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href={ROUTES.home}
            className="font-display text-xl tracking-tight text-charcoal transition-colors hover:text-maroon sm:text-[1.65rem] lg:absolute lg:left-1/2 lg:-translate-x-1/2"
          >
            {SITE_NAME}
          </Link>

          {/* Right nav — desktop + icons */}
          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
            <nav className="mr-4 hidden items-center gap-7 lg:flex">
              {navLinks.slice(3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="link-subtle text-[13px] tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href={`${ROUTES.shop}?focus=search`}
              className="rounded-full p-2.5 text-stone transition-all duration-300 hover:text-charcoal"
              aria-label="Search"
            >
              <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            </Link>
            <Link
              href={ROUTES.wishlist}
              className="relative rounded-full p-2.5 text-stone transition-all duration-300 hover:text-charcoal"
              aria-label="Wishlist"
            >
              <Heart className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-charcoal px-0.5 text-[8px] font-medium text-pearl">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full p-2.5 text-stone transition-all duration-300 hover:text-charcoal"
              aria-label="Cart"
            >
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-charcoal px-0.5 text-[8px] font-medium text-pearl">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href={accountHref}
              className="hidden rounded-full p-2.5 text-stone transition-all duration-300 hover:text-charcoal sm:block"
              aria-label="Account"
            >
              <User className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className="rounded-full p-2.5 text-stone transition-all duration-300 hover:text-charcoal lg:hidden"
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
            "absolute inset-0 bg-charcoal/30 backdrop-blur-sm transition-opacity duration-400 ease-premium",
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
