"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";

const navLinks = [
  { href: ROUTES.shop, label: "Shop" },
  { href: ROUTES.category("sarees"), label: "Sarees" },
  { href: ROUTES.category("lehengas"), label: "Lehengas" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  return (
    <header className="sticky top-0 z-50 border-b border-burgundy/10 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="font-display text-2xl text-burgundy">
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-stone transition-colors hover:text-burgundy"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={`${ROUTES.shop}?focus=search`}
            className="rounded-full p-2 text-stone hover:bg-ivory hover:text-burgundy"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href={ROUTES.wishlist}
            className="relative rounded-full p-2 text-stone hover:bg-ivory hover:text-burgundy"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] text-cream">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href={ROUTES.login}
            className="hidden rounded-full p-2 text-stone hover:bg-ivory hover:text-burgundy sm:block"
            aria-label="Account"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-stone hover:bg-ivory md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-burgundy/10 bg-cream md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-3 py-2 text-sm text-charcoal hover:bg-ivory"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ROUTES.login}
            className="rounded-sm px-3 py-2 text-sm text-burgundy"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
