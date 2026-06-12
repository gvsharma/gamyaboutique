"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountGuard } from "@/components/account/account-guard";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.account, label: "Profile" },
  { href: ROUTES.accountAddresses, label: "Addresses" },
  { href: ROUTES.wishlist, label: "Wishlist" },
  { href: ROUTES.cart, label: "Bag" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOnly = [ROUTES.login, ROUTES.register, ROUTES.forgotPassword, ROUTES.resetPassword].some(
    (p) => pathname.startsWith(p),
  );

  if (isAuthOnly || pathname === ROUTES.cart || pathname === ROUTES.wishlist) {
    return <>{children}</>;
  }

  return (
    <AccountGuard>
      <div className="container-premium py-10 sm:py-12">
        <nav className="mb-8 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-all duration-300 ease-premium",
                pathname === link.href
                  ? "bg-maroon text-pearl shadow-soft"
                  : "border border-charcoal/10 text-charcoal hover:border-maroon/20 hover:text-maroon",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </AccountGuard>
  );
}
