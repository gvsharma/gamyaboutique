"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchCrmLeads } from "@/lib/api/services/admin.service";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminLeadsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "leads", page],
    queryFn: () => fetchCrmLeads({ page, size: 20 }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">CRM</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Leads</h1>
        <p className="mt-1 text-sm text-stone">CRM leads from /api/v1/crm/leads</p>
      </div>

      {isLoading && <p className="text-sm text-stone">Loading leads…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load leads.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Source</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((lead) => (
              <tr key={lead.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">{lead.name}</td>
                <td className="px-5 py-3.5 text-stone">{lead.email ?? "—"}</td>
                <td className="px-5 py-3.5 text-stone">{lead.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="chip">{lead.source}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="chip">{lead.status}</span>
                </td>
                <td className="px-5 py-3.5 text-stone">{formatDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">No leads found.</p>
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
