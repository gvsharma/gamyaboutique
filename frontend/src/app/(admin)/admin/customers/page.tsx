"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAdminCustomers } from "@/lib/api/services/admin.service";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminCustomersPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "customers", page],
    queryFn: () => fetchAdminCustomers({ page, size: 20 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Accounts</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Customers</h1>
        <p className="mt-1 text-sm text-stone">Customer profiles (read-only)</p>
      </div>

      {isLoading && <p className="text-sm text-stone">Loading customers…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load customers.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">User linked</th>
              <th className="px-5 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((customer) => (
              <tr key={customer.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">
                  {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-5 py-3.5 text-stone">{customer.email ?? "—"}</td>
                <td className="px-5 py-3.5 text-stone">{customer.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="chip">{customer.userId ? "Yes" : "No"}</span>
                </td>
                <td className="px-5 py-3.5 text-stone">{formatDate(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">No customers found.</p>
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
