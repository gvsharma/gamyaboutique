"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminDrawer } from "@/components/ui/admin-drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/constants/routes";
import { fetchAdminInterests, updateInterestStatus } from "@/lib/api/services/admin.service";
import { whatsAppInterestMessage, whatsAppUrl } from "@/lib/whatsapp";
import type { CustomerInterest, CustomerInterestStatus } from "@/types/admin";

const PIPELINE: CustomerInterestStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "TRIAL_BOOKED",
  "CONFIRMED",
  "DELIVERED",
  "LOST",
];

const ACTIVE_PIPELINE = PIPELINE.filter((s) => s !== "LOST");

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function InterestCard({
  interest,
  onOpen,
}: {
  interest: CustomerInterest;
  onOpen: () => void;
}) {
  const phone = interest.phone ?? interest.whatsapp;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-charcoal/8 bg-pearl p-3 text-left transition-shadow hover:shadow-card"
    >
      <p className="font-medium text-charcoal">{interest.product.name}</p>
      <p className="mt-1 text-xs text-stone">{interest.customerName ?? "Guest"}</p>
      {phone && <p className="mt-1 text-xs text-stone">{phone}</p>}
      {(interest.size || interest.color) && (
        <p className="mt-2 text-[11px] text-stone">
          {[interest.size, interest.color].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-2 text-[10px] uppercase tracking-wide text-stone/70">{formatDate(interest.createdAt)}</p>
    </button>
  );
}

export default function AdminInterestsPage() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [statusFilter, setStatusFilter] = useState<CustomerInterestStatus | "">("");
  const [selected, setSelected] = useState<CustomerInterest | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status) setStatusFilter(status as CustomerInterestStatus);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "interests", statusFilter],
    queryFn: () =>
      fetchAdminInterests({
        page: 0,
        size: 100,
        status: statusFilter || undefined,
      }),
  });

  const interests = data?.content ?? [];

  const grouped = useMemo(() => {
    const map: Record<string, CustomerInterest[]> = Object.fromEntries(
      PIPELINE.map((s) => [s, [] as CustomerInterest[]]),
    );
    for (const interest of interests) {
      map[interest.status]?.push(interest);
    }
    return map;
  }, [interests]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerInterestStatus }) =>
      updateInterestStatus(id, status, note.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "interests"] });
      toast("Interest updated");
      setSelected(null);
      setNote("");
    },
    onError: () => toast("Failed to update interest", "error"),
  });

  const phone = selected?.phone ?? selected?.whatsapp;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-eyebrow">CRM</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">Interests</h1>
          <p className="mt-1 text-sm text-stone">Pipeline for product inquiries</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={view === "kanban" ? "primary" : "outline"} onClick={() => setView("kanban")}>
            Board
          </Button>
          <Button size="sm" variant={view === "table" ? "primary" : "outline"} onClick={() => setView("table")}>
            Table
          </Button>
        </div>
      </div>

      <select
        className="admin-input !mt-0 w-48"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as CustomerInterestStatus | "")}
      >
        <option value="">All statuses</option>
        {PIPELINE.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      {isLoading && <p className="text-sm text-stone">Loading interests…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load interests.</p>}

      {view === "kanban" && !isLoading && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ACTIVE_PIPELINE.map((status) => (
            <div key={status} className="min-w-[15rem] shrink-0">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone">
                  {status.replace(/_/g, " ")}
                </p>
                <span className="chip">{grouped[status]?.length ?? 0}</span>
              </div>
              <div className="space-y-2">
                {(grouped[status] ?? []).map((interest) => (
                  <InterestCard key={interest.id} interest={interest} onOpen={() => setSelected(interest)} />
                ))}
                {(grouped[status] ?? []).length === 0 && (
                  <p className="rounded-xl border border-dashed border-charcoal/10 px-3 py-6 text-center text-xs text-stone">
                    Empty
                  </p>
                )}
              </div>
            </div>
          ))}
          <div className="min-w-[15rem] shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone">Lost</p>
              <span className="chip">{grouped.LOST?.length ?? 0}</span>
            </div>
            <div className="space-y-2">
              {(grouped.LOST ?? []).map((interest) => (
                <InterestCard key={interest.id} interest={interest} onOpen={() => setSelected(interest)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "table" && (
        <div className="admin-card overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
              <tr>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Size / Color</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody>
              {interests.map((interest) => (
                <tr
                  key={interest.id}
                  className="cursor-pointer border-b border-charcoal/5 last:border-0 hover:bg-ivory/40"
                  onClick={() => setSelected(interest)}
                >
                  <td className="px-5 py-3.5 text-charcoal">{interest.product.name}</td>
                  <td className="px-5 py-3.5 text-stone">{interest.customerName ?? "—"}</td>
                  <td className="px-5 py-3.5 text-stone">{interest.phone ?? interest.whatsapp ?? "—"}</td>
                  <td className="px-5 py-3.5 text-stone">
                    {[interest.size, interest.color].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="chip">{interest.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-stone">{formatDate(interest.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminDrawer
        open={Boolean(selected)}
        title="Interest detail"
        onClose={() => {
          setSelected(null);
          setNote("");
        }}
        widthClass="max-w-md"
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <p className="text-eyebrow text-stone">Product</p>
              <Link href={ROUTES.product(selected.product.id)} className="font-medium text-maroon hover:underline">
                {selected.product.name}
              </Link>
              <p className="text-xs text-stone">SKU {selected.product.sku}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-eyebrow text-stone">Customer</p>
                <p>{selected.customerName ?? "—"}</p>
              </div>
              <div>
                <p className="text-eyebrow text-stone">Phone</p>
                <p>{phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-eyebrow text-stone">Size</p>
                <p>{selected.size ?? "—"}</p>
              </div>
              <div>
                <p className="text-eyebrow text-stone">Color</p>
                <p>{selected.color ?? "—"}</p>
              </div>
            </div>
            {selected.message && (
              <div>
                <p className="text-eyebrow text-stone">Message</p>
                <p className="text-sm text-charcoal">{selected.message}</p>
              </div>
            )}
            {phone && (
              <a
                href={whatsAppUrl(whatsAppInterestMessage(selected.product.name, selected.customerName))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp customer
              </a>
            )}
            <div>
              <label className="text-eyebrow text-stone">Move to stage</label>
              <select
                className="admin-input mt-1"
                value={selected.status}
                onChange={(e) =>
                  statusMutation.mutate({
                    id: selected.id,
                    status: e.target.value as CustomerInterestStatus,
                  })
                }
                disabled={statusMutation.isPending}
              >
                {PIPELINE.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-eyebrow text-stone">Note (optional)</label>
              <textarea
                className="admin-input mt-1 min-h-20"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Trial scheduled for Saturday…"
              />
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
