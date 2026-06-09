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
    return <p className="text-sm text-burgundy">Could not load dashboard. Is the backend running?</p>;
  }

  const cards = [
    { label: "Active products", value: data.activeProducts, href: ROUTES.admin.products },
    { label: "Active categories", value: data.activeCategories, href: ROUTES.admin.categories },
    { label: "Open leads", value: data.openLeads, href: ROUTES.admin.home },
    { label: "Recent interests (7d)", value: data.recentInterests, href: ROUTES.admin.home },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-burgundy">Dashboard</h1>
        <p className="mt-1 text-sm text-stone">
          Manage products, categories, and images connected to RDS and S3.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-sm border border-burgundy/10 bg-cream p-5 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs uppercase tracking-wider text-stone">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-burgundy">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-sm border border-burgundy/10 bg-cream p-5 text-sm text-stone">
        <p className="font-medium text-charcoal">Quick actions</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <Link href={ROUTES.admin.productNew} className="text-burgundy hover:underline">
              Add a new product with S3 images
            </Link>
          </li>
          <li>
            <Link href={ROUTES.admin.categories} className="text-burgundy hover:underline">
              Manage categories in RDS
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
