"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { fetchAdminUsers, updateUserEnabled } from "@/lib/api/services/admin.service";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => fetchAdminUsers({ page, size: 20 }),
  });

  const handleToggle = async (id: string, enabled: boolean) => {
    setActionError(null);
    try {
      await updateUserEnabled(id, !enabled);
      await refetch();
    } catch {
      setActionError("Failed to update user.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Accounts</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Users</h1>
        <p className="mt-1 text-sm text-stone">Registered user accounts and roles</p>
      </div>

      {actionError && <p className="text-sm text-maroon">{actionError}</p>}
      {isLoading && <p className="text-sm text-stone">Loading users…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load users.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Roles</th>
              <th className="px-5 py-3.5">Enabled</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((user) => (
              <tr key={user.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-5 py-3.5 text-stone">{user.email ?? "—"}</td>
                <td className="px-5 py-3.5 text-stone">{user.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="chip">{user.roles.join(", ")}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={user.enabled ? "text-charcoal" : "text-maroon"}>
                    {user.enabled ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-stone">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-2">
                    <Link href={ROUTES.admin.userDetail(user.id)}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => handleToggle(user.id, user.enabled)}>
                      {user.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && data?.content.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone">No users found.</p>
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
