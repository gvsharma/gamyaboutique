"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Tags,
  Users,
  UserCircle,
  Sparkles,
  Inbox,
  Layers,
  FileText,
  Video,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const nav = [
  { href: ROUTES.admin.home, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.admin.products, label: "Products", icon: Package },
  { href: ROUTES.admin.categories, label: "Categories", icon: Tags },
  { href: ROUTES.admin.users, label: "Users", icon: Users },
  { href: ROUTES.admin.customers, label: "Customers", icon: UserCircle },
  { href: ROUTES.admin.carts, label: "Carts", icon: ShoppingCart },
  { href: ROUTES.admin.wishlists, label: "Wishlists", icon: Heart },
  { href: ROUTES.admin.interests, label: "Interests", icon: Sparkles },
  { href: ROUTES.admin.leads, label: "Leads", icon: Inbox },
  { href: ROUTES.admin.collections, label: "Collections", icon: FolderOpen },
  { href: ROUTES.admin.taxonomy, label: "Taxonomy", icon: Layers },
  { href: ROUTES.admin.promoVideos, label: "Promo videos", icon: Video },
  { href: ROUTES.admin.policies, label: "Policies", icon: FileText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push(ROUTES.login);
  };

  return (
    <div className="min-h-screen bg-ivory/40">
      <header className="sticky top-0 z-40 border-b border-charcoal/5 bg-pearl/90 backdrop-blur-xl">
        <div className="container-premium flex items-center justify-between py-4">
          <div>
            <p className="font-display text-xl text-charcoal">{SITE_NAME} Admin</p>
            <p className="text-xs text-stone">{user?.email ?? user?.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={ROUTES.home} className="link-subtle text-xs">
              View storefront
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container-premium grid gap-6 py-8 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="h-fit rounded-2xl bg-pearl p-3 shadow-soft">
          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ease-premium",
                    active
                      ? "bg-maroon text-pearl shadow-soft"
                      : "text-charcoal hover:bg-ivory hover:text-maroon",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
