"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchAdminInterests, updateInterestStatus } from "@/lib/api/services/admin.service";
import type { CustomerInterestStatus } from "@/types/admin";

const STATUSES: CustomerInterestStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "TRIAL_BOOKED",
  "CONFIRMED",
  "DELIVERED",
  "LOST",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminInterestsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<CustomerInterestStatus | "">("");
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "interests", page, statusFilter],
    queryFn: () =>
      fetchAdminInterests({
        page,
        size: 20,
        status: statusFilter || undefined,
      }),
  });

  const handleStatusChange = async (id: string, status: CustomerInterestStatus) => {
    setActionError(null);
    try {
      await updateInterestStatus(id, status);
      await refetch();
    } catch {
      setActionError("Failed to update interest status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">CRM</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Interests</h1>
        <p className="mt-1 text-sm text-stone">Product interest submissions from customers</p>
      </div>

      <select
        className="admin-input !mt-0 w-48"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as CustomerInterestStatus | "")}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {actionError && <p className="text-sm text-maroon">{actionError}</p>}
      {isLoading && <p className="text-sm text-stone">Loading interests…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load interests.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5">Update</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((interest) => (
              <tr key={interest.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">{interest.product.name}</td>
                <td className="px-5 py-3.5 text-stone">{interest.customerName ?? "—"}</td>
                <td className="px-5 py-3.5 text-stone">{interest.phone ?? interest.whatsapp ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="chip">{interest.status}</span>
                </td>
                <td className="px-5 py-3.5 text-stone">{formatDate(interest.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <select
                    className="admin-input !mt-0 !py-1 text-xs"
                    value={interest.status}
                    onChange={(e) =>
                      handleStatusChange(interest.id, e.target.value as CustomerInterestStatus)
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">No interests found.</p>
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
