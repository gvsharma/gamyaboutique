"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  fetchAdminCustomer,
  fetchAdminInterests,
} from "@/lib/api/services/admin.service";
import { whatsAppUrl } from "@/lib/whatsapp";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: () => fetchAdminCustomer(id),
  });

  const { data: interestsData } = useQuery({
    queryKey: ["admin", "interests", "customer", customer?.phone],
    queryFn: () => fetchAdminInterests({ page: 0, size: 50 }),
    enabled: Boolean(customer?.phone),
  });

  const relatedInterests =
    interestsData?.content.filter(
      (i) =>
        customer?.phone &&
        (i.phone === customer.phone || i.whatsapp === customer.phone),
    ) ?? [];

  if (isLoading) return <p className="text-sm text-stone">Loading customer…</p>;
  if (isError || !customer) return <p className="text-sm text-maroon">Customer not found.</p>;

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-eyebrow">Customer 360</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">{fullName}</h1>
          <p className="mt-1 text-sm text-stone">Joined {formatDate(customer.createdAt)}</p>
        </div>
        <Link href={ROUTES.admin.customers}>
          <Button variant="outline" size="sm">
            Back to list
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="admin-card">
          <p className="text-eyebrow text-stone">Email</p>
          <p className="mt-2 text-charcoal">{customer.email ?? "—"}</p>
        </div>
        <div className="admin-card">
          <p className="text-eyebrow text-stone">Phone</p>
          <p className="mt-2 text-charcoal">{customer.phone ?? "—"}</p>
          {customer.phone && (
            <a
              href={whatsAppUrl(`Hi ${fullName}, this is Gamya Couture.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-maroon hover:underline"
            >
              WhatsApp
            </a>
          )}
        </div>
        <div className="admin-card">
          <p className="text-eyebrow text-stone">Active carts</p>
          <p className="mt-2 font-display text-3xl text-maroon">{customer.cartCount}</p>
        </div>
        <div className="admin-card">
          <p className="text-eyebrow text-stone">Wishlist items</p>
          <p className="mt-2 font-display text-3xl text-maroon">{customer.wishlistCount}</p>
        </div>
      </div>

      {customer.notes && (
        <div className="admin-card">
          <p className="text-eyebrow text-stone">Notes</p>
          <p className="mt-2 text-sm text-charcoal">{customer.notes}</p>
        </div>
      )}

      <div className="admin-card">
        <div className="flex items-center justify-between">
          <p className="font-medium text-charcoal">Product interests</p>
          <Link href={ROUTES.admin.interests} className="text-sm text-maroon hover:underline">
            View pipeline
          </Link>
        </div>
        {relatedInterests.length === 0 ? (
          <p className="mt-4 text-sm text-stone">No interests matched by phone.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {relatedInterests.map((interest) => (
              <li key={interest.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal/5 pb-3 last:border-0">
                <div>
                  <p className="text-charcoal">{interest.product.name}</p>
                  <p className="text-xs text-stone">
                    {interest.status} · {formatDate(interest.createdAt)}
                  </p>
                </div>
                <span className="chip">{interest.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {customer.userId && (
        <Link href={ROUTES.admin.userDetail(customer.userId)} className="text-sm text-maroon hover:underline">
          View linked user account →
        </Link>
      )}
    </div>
  );
}
