"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteWishlistItem, fetchAdminWishlists } from "@/lib/api/services/admin.service";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminWishlistsPage() {
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "wishlists", page],
    queryFn: () => fetchAdminWishlists({ page, size: 20 }),
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this wishlist item?")) return;
    setActionError(null);
    try {
      await deleteWishlistItem(id);
      await refetch();
    } catch {
      setActionError("Failed to remove wishlist item.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Commerce</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Wishlists</h1>
        <p className="mt-1 text-sm text-stone">Customer saved products</p>
      </div>

      {actionError && <p className="text-sm text-maroon">{actionError}</p>}
      {isLoading && <p className="text-sm text-stone">Loading wishlists…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load wishlists.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Added</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((item) => (
              <tr key={item.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">
                  {item.customerName ?? item.customerEmail ?? item.customerId.slice(0, 8)}
                </td>
                <td className="px-5 py-3.5 text-stone">{item.productName}</td>
                <td className="px-5 py-3.5 text-stone">{formatDate(item.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">No wishlist items found.</p>
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
