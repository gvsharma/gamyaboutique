"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { fetchAdminCarts } from "@/lib/api/services/admin.service";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminCartsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "carts", page],
    queryFn: () => fetchAdminCarts({ page, size: 20 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Commerce</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Carts</h1>
        <p className="mt-1 text-sm text-stone">Active and guest shopping carts</p>
      </div>

      {isLoading && <p className="text-sm text-stone">Loading carts…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load carts.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Items</th>
              <th className="px-5 py-3.5">Updated</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((cart) => (
              <tr key={cart.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">
                  {cart.customerName ?? cart.customerEmail ?? (
                    <span className="font-mono text-xs text-stone">Guest {cart.guestToken?.slice(0, 8)}</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="chip">{cart.status}</span>
                </td>
                <td className="px-5 py-3.5 text-stone">{cart.itemCount}</td>
                <td className="px-5 py-3.5 text-stone">{formatDate(cart.updatedAt)}</td>
                <td className="px-5 py-3.5">
                  <Link href={ROUTES.admin.cartDetail(cart.id)}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">No carts found.</p>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={data.first} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
