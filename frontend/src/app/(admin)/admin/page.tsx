"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchDashboardSummary } from "@/lib/api/services/admin.service";
import { ROUTES } from "@/constants/routes";

export default function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardSummary,
  });

  if (isLoading) {
    return <p className="text-sm text-stone">Loading dashboard…</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-maroon">Could not load dashboard. Is the backend running?</p>;
  }

  const cards = [
    { label: "Active products", value: data.activeProducts, href: ROUTES.admin.products },
    { label: "Active categories", value: data.activeCategories, href: ROUTES.admin.categories },
    { label: "Open leads", value: data.openLeads, href: ROUTES.admin.home },
    { label: "Recent interests (7d)", value: data.recentInterests, href: ROUTES.admin.home },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-eyebrow">Overview</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Dashboard</h1>
        <p className="mt-2 text-body">Manage products, categories, and customer interest.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="admin-card group transition-shadow duration-300 hover:shadow-card"
          >
            <p className="text-eyebrow text-stone">{card.label}</p>
            <p className="mt-3 font-display text-4xl text-maroon transition-colors group-hover:text-charcoal">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <p className="font-medium text-charcoal">Quick actions</p>
        <ul className="mt-4 space-y-2 text-sm text-stone">
          <li>
            <Link href={ROUTES.admin.productNew} className="link-subtle text-maroon">
              Add a new product with images
            </Link>
          </li>
          <li>
            <Link href={ROUTES.admin.categories} className="link-subtle text-maroon">
              Manage categories
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
