"use client";

import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MAIN_NAV, type NavItem } from "@/constants/nav-links";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/site";
import { fetchCart } from "@/lib/api/services/cart.service";
import { tokenStorage } from "@/lib/auth/token-storage";
import { queryKeys } from "@/lib/query/query-keys";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";

function NavBadge({ type }: { type: "new" }) {
  if (type === "new") {
    return <span className="badge-editorial ml-1.5">New</span>;
  }
  return null;
}

function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!item.children?.length) {
    return (
      <Link
        href={item.href ?? ROUTES.shop}
        className={cn(
          "nav-link-premium group relative inline-flex shrink-0 items-center whitespace-nowrap",
          item.highlight && "font-semibold text-maroon",
        )}
      >
        {item.label}
        {item.badge && <NavBadge type={item.badge} />}
        <span
          className={cn(
            "absolute -bottom-1 left-0 h-px w-0 bg-maroon transition-all duration-300 ease-premium group-hover:w-full",
            item.highlight && "w-full bg-maroon/40 group-hover:w-full group-hover:bg-maroon",
          )}
          aria-hidden
        />
      </Link>
    );
  }

  return (
    <div
      className={cn("relative shrink-0", open && "z-[60]")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href ?? "#"}
        className={cn(
          "nav-link-premium group inline-flex items-center gap-1 whitespace-nowrap",
          item.highlight && "font-semibold text-maroon",
          open && "text-maroon",
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
      >
        {item.label}
        {item.badge && <NavBadge type={item.badge} />}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-50 transition-transform duration-300 ease-premium",
            open && "rotate-180 opacity-100",
          )}
          strokeWidth={1.75}
        />
      </Link>

      <div
        id={panelId}
        className={cn(
          "absolute left-1/2 top-full z-[60] min-w-[15rem] -translate-x-1/2 pt-2 transition-all duration-300 ease-premium",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="nav-dropdown-panel">
          <ul className="py-1.5">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link href={child.href} className="nav-dropdown-link group/item">
                  <span className="nav-dropdown-label">{child.label}</span>
                  {child.description && (
                    <span className="nav-dropdown-desc">{child.description}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({
  item,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (!item.children?.length) {
    return (
      <li>
        <Link
          href={item.href ?? ROUTES.shop}
          className={cn(
            "flex items-center rounded-xl px-3 py-3 font-display text-lg text-charcoal transition-colors hover:bg-warm hover:text-maroon",
            item.highlight && "text-maroon",
          )}
          onClick={onNavigate}
        >
          {item.label}
          {item.badge && <NavBadge type={item.badge} />}
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-charcoal/5 last:border-0">
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-display text-lg text-charcoal transition-colors hover:bg-warm",
          item.highlight && "text-maroon",
          expanded && "bg-warm text-maroon",
        )}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="inline-flex items-center">
          {item.label}
          {item.badge && <NavBadge type={item.badge} />}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-stone transition-transform duration-300",
            expanded && "rotate-180 text-maroon",
          )}
        />
      </button>
      <ul
        className={cn(
          "overflow-hidden border-l-2 border-maroon/15 pl-3 transition-all duration-300 ease-premium",
          expanded ? "mb-2 max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {item.children.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              className="block rounded-lg py-2.5 pl-3 pr-3 text-sm text-charcoal/80 transition-colors hover:bg-warm hover:text-maroon"
              onClick={onNavigate}
            >
              {child.label}
            </Link>
          </li>
        ))}
        {item.href && (
          <li>
            <Link
              href={item.href}
              className="block py-2.5 pl-6 pr-3 text-xs font-medium uppercase tracking-wider text-maroon"
              onClick={onNavigate}
            >
              View all {item.label}
            </Link>
          </li>
        )}
      </ul>
    </li>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
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

  const desktopNavItems = MAIN_NAV.filter((item) => item.label !== "Home");

  return (
    <>
      <div className="sticky top-0 z-50">
        <div className="hidden border-b border-pearl/10 bg-charcoal py-2.5 text-center sm:block">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-pearl/80">
            Bespoke stitching for women &amp; girls ·{" "}
            <Link href={ROUTES.contact} className="text-pearl transition-colors hover:text-mustard">
              Book a consultation
            </Link>
          </p>
        </div>

        <header
          className={cn(
            "border-b border-charcoal/5 transition-all duration-500 ease-premium",
            scrolled
              ? "bg-pearl/98 shadow-soft backdrop-blur-xl"
              : "bg-pearl",
          )}
        >
          <div className="container-premium flex h-14 items-center gap-3 lg:h-[4.25rem] lg:gap-4">
            <Link
              href={ROUTES.home}
              className="relative z-10 shrink-0 font-sans text-sm font-bold uppercase tracking-[0.18em] text-charcoal transition-colors hover:text-maroon sm:text-[15px] lg:mr-1"
            >
              {SITE_NAME}
            </Link>

            <nav
              className="hidden min-w-0 flex-1 items-center justify-center gap-x-3 overflow-x-auto scrollbar-none 2xl:flex 2xl:gap-x-4"
              aria-label="Main navigation"
            >
              {desktopNavItems.map((item) => (
                <DesktopNavItem key={item.label} item={item} />
              ))}
            </nav>

            <div className="relative z-10 ml-auto flex shrink-0 items-center gap-0.5 bg-inherit pl-2 sm:gap-1">
            <Link
              href={`${ROUTES.shop}?focus=search`}
              className="rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-warm hover:text-charcoal"
              aria-label="Search"
            >
              <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            </Link>
            <Link
              href={ROUTES.wishlist}
              className="relative rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-warm hover:text-charcoal"
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
              className="relative rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-warm hover:text-charcoal"
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
              className="hidden rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-warm hover:text-charcoal sm:block"
              aria-label="Account"
            >
              <User className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className="rounded-full p-2.5 text-stone transition-all duration-300 hover:bg-warm hover:text-charcoal 2xl:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Tablet: compact secondary row with dropdown links */}
        <nav
          className="hidden border-t border-charcoal/5 lg:flex 2xl:hidden"
          aria-label="Main navigation tablet"
        >
          <div className="container-premium flex items-center justify-center gap-4 overflow-x-auto py-2.5 scrollbar-none">
            {desktopNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href ?? item.children?.[0]?.href ?? ROUTES.shop}
                className={cn(
                  "nav-link-premium shrink-0 whitespace-nowrap text-[11px]",
                  item.highlight && "font-semibold text-maroon",
                )}
              >
                {item.label}
                {item.badge && <NavBadge type={item.badge} />}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[80] 2xl:hidden",
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
            "absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-pearl shadow-elevated transition-transform duration-500 ease-premium",
            open ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between border-b border-charcoal/5 px-6 py-5">
            <span className="font-display text-xl text-charcoal">Menu</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-stone hover:bg-warm hover:text-charcoal"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-4 py-4">
            {MAIN_NAV.map((item) => (
              <MobileNavItem
                key={item.label}
                item={item}
                expanded={mobileExpanded === item.label}
                onToggle={() =>
                  setMobileExpanded((prev) => (prev === item.label ? null : item.label))
                }
                onNavigate={() => {
                  setOpen(false);
                  setMobileExpanded(null);
                }}
              />
            ))}
            <li className="mt-4 border-t border-charcoal/5 pt-4">
              <Link
                href={accountHref}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-maroon"
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
