"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { fetchAdminUser, updateUserEnabled } from "@/lib/api/services/admin.service";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => fetchAdminUser(id),
  });

  const handleToggle = async () => {
    if (!data) return;
    try {
      await updateUserEnabled(id, !data.enabled);
      await refetch();
    } catch {
      alert("Failed to update user.");
    }
  };

  if (isLoading) return <p className="text-sm text-stone">Loading user…</p>;
  if (isError || !data) return <p className="text-sm text-maroon">User not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-eyebrow">User detail</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">
            {data.firstName} {data.lastName}
          </h1>
          <p className="mt-1 text-sm text-stone">{data.email ?? data.phone}</p>
        </div>
        <div className="flex gap-2">
          <Link href={ROUTES.admin.users}>
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <Button size="sm" onClick={handleToggle}>
            {data.enabled ? "Disable account" : "Enable account"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="admin-card">
          <p className="text-eyebrow text-stone">Account</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone">Roles</dt>
              <dd className="text-charcoal">{data.roles.join(", ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Enabled</dt>
              <dd className="text-charcoal">{data.enabled ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Customer ID</dt>
              <dd className="font-mono text-xs text-stone">{data.customerId ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Created</dt>
              <dd className="text-charcoal">{formatDate(data.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Updated</dt>
              <dd className="text-charcoal">{formatDate(data.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-card">
          <p className="text-eyebrow text-stone">Engagement</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone">Carts</dt>
              <dd className="text-charcoal">{data.cartCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone">Wishlist items</dt>
              <dd className="text-charcoal">{data.wishlistCount}</dd>
            </div>
          </dl>
          {data.customerId && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={ROUTES.admin.carts}>
                <Button size="sm" variant="outline">
                  View carts
                </Button>
              </Link>
              <Link href={ROUTES.admin.wishlists}>
                <Button size="sm" variant="outline">
                  View wishlists
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
