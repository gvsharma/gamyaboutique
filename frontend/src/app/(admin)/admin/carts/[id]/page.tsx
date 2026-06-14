"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { fetchAdminCart } from "@/lib/api/services/admin.service";
import { formatPrice } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminCartDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "carts", id],
    queryFn: () => fetchAdminCart(id),
  });

  if (isLoading) return <p className="text-sm text-stone">Loading cart…</p>;
  if (isError || !data) return <p className="text-sm text-maroon">Cart not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-eyebrow">Cart detail</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">
            {data.customerName ?? data.customerEmail ?? "Guest cart"}
          </h1>
          <p className="mt-1 text-sm text-stone">
            <span className="chip">{data.status}</span>
            <span className="ml-2">Updated {formatDate(data.updatedAt)}</span>
          </p>
        </div>
        <Link href={ROUTES.admin.carts}>
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>
      </div>

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">SKU</th>
              <th className="px-5 py-3.5">Qty</th>
              <th className="px-5 py-3.5">Price</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">{item.productName}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-stone">{item.sku}</td>
                <td className="px-5 py-3.5 text-stone">{item.quantity}</td>
                <td className="px-5 py-3.5 text-maroon">
                  {item.price != null ? formatPrice(item.price) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.items.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">Cart is empty.</p>
        )}
      </div>
    </div>
  );
}
