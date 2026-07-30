"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminDrawer } from "@/components/ui/admin-drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  createCrmLead,
  deleteCrmLead,
  fetchCrmLeads,
  updateCrmLeadStatus,
  updateCrmLeadStylistNotes,
} from "@/lib/api/services/admin.service";
import type { CrmLead, LeadSource, LeadStatus, UpsertLeadPayload } from "@/types/admin";

const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "LOST", "WON"];
const SOURCES: LeadSource[] = [
  "WEBSITE",
  "CUSTOMER_INTEREST",
  "CONSULTATION",
  "REFERRAL",
  "WALK_IN",
  "OTHER",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export default function AdminLeadsPage() {
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [stylistNotes, setStylistNotes] = useState("");
  const [form, setForm] = useState<UpsertLeadPayload>({
    name: "",
    email: "",
    phone: "",
    source: "WEBSITE",
    notes: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "leads", page],
    queryFn: () => fetchCrmLeads({ page, size: 20 }),
  });

  const openLead = (lead: CrmLead) => {
    setSelectedLead(lead);
    setStylistNotes(lead.stylistNotes ?? "");
  };

  const createMutation = useMutation({
    mutationFn: createCrmLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      toast("Lead created");
      setCreateOpen(false);
      setForm({ name: "", email: "", phone: "", source: "WEBSITE", notes: "" });
    },
    onError: () => toast("Failed to create lead", "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateCrmLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      toast("Lead updated");
    },
    onError: () => toast("Failed to update lead", "error"),
  });

  const stylistNotesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      updateCrmLeadStylistNotes(id, notes),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      setSelectedLead(updated);
      toast("Stylist notes saved");
    },
    onError: () => toast("Failed to save notes", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCrmLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
      toast("Lead deleted");
      setSelectedLead(null);
    },
    onError: () => toast("Failed to delete lead", "error"),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-eyebrow">CRM</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">Leads & consultations</h1>
          <p className="mt-1 text-sm text-stone">Inquiries, consultations, and stylist follow-ups</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Add lead</Button>
      </div>

      {isLoading && <p className="text-sm text-stone">Loading leads…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load leads.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Source</th>
              <th className="px-5 py-3.5">Context</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((lead: CrmLead) => (
              <tr key={lead.id} className="border-b border-charcoal/5 last:border-0">
                <td className="px-5 py-3.5 text-charcoal">{lead.name}</td>
                <td className="px-5 py-3.5 text-stone">{lead.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="chip">{lead.source.replace(/_/g, " ")}</span>
                </td>
                <td className="px-5 py-3.5 text-stone">
                  {lead.productName ? (
                    <span className="text-charcoal">{lead.productName}</span>
                  ) : lead.occasion ? (
                    lead.occasion
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <select
                    className="admin-input !mt-0 !py-1 text-xs"
                    value={lead.status}
                    onChange={(e) =>
                      statusMutation.mutate({ id: lead.id, status: e.target.value as LeadStatus })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3.5 text-stone">{formatDate(lead.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <Button size="sm" variant="ghost" onClick={() => openLead(lead)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <AdminDrawer
        open={Boolean(selectedLead)}
        title={selectedLead?.name ?? "Lead"}
        onClose={() => setSelectedLead(null)}
      >
        {selectedLead && (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <p><span className="text-stone">Email:</span> {selectedLead.email ?? "—"}</p>
              <p><span className="text-stone">Phone:</span> {selectedLead.phone ?? "—"}</p>
              <p><span className="text-stone">Source:</span> {selectedLead.source}</p>
              <p><span className="text-stone">Status:</span> {selectedLead.status}</p>
            </div>
            {selectedLead.productName && (
              <p><span className="text-stone">Product:</span> {selectedLead.productName}</p>
            )}
            {(selectedLead.occasion || selectedLead.budgetBand || selectedLead.timeline) && (
              <div className="rounded-xl bg-ivory/60 p-4 text-stone">
                {selectedLead.occasion && <p>Occasion: {selectedLead.occasion}</p>}
                {selectedLead.budgetBand && <p>Budget: {selectedLead.budgetBand}</p>}
                {selectedLead.timeline && <p>Timeline: {selectedLead.timeline}</p>}
                {selectedLead.serviceType && <p>Service: {selectedLead.serviceType}</p>}
              </div>
            )}
            {selectedLead.notes && (
              <div>
                <p className="text-eyebrow text-stone">Customer message</p>
                <p className="mt-2 whitespace-pre-wrap text-charcoal">{selectedLead.notes}</p>
              </div>
            )}
            <div>
              <label className="text-eyebrow text-stone">Stylist notes (internal)</label>
              <textarea
                className="admin-input mt-1 min-h-28"
                value={stylistNotes}
                onChange={(e) => setStylistNotes(e.target.value)}
                placeholder="Follow-up plan, measurements discussed, fabric suggestions…"
              />
              <Button
                type="button"
                size="sm"
                className="mt-3"
                disabled={stylistNotesMutation.isPending}
                onClick={() =>
                  stylistNotesMutation.mutate({
                    id: selectedLead.id,
                    notes: stylistNotes.trim() || null,
                  })
                }
              >
                {stylistNotesMutation.isPending ? "Saving…" : "Save stylist notes"}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this lead?")) deleteMutation.mutate(selectedLead.id);
              }}
            >
              Delete lead
            </Button>
          </div>
        )}
      </AdminDrawer>

      <AdminDrawer open={createOpen} title="New lead" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-eyebrow text-stone">Name</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-eyebrow text-stone">Email</label>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-eyebrow text-stone">Phone</label>
            <input
              className="admin-input"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-eyebrow text-stone">Source</label>
            <select
              className="admin-input"
              value={form.source ?? "WEBSITE"}
              onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-eyebrow text-stone">Notes</label>
            <textarea
              className="admin-input min-h-20"
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create lead"}
          </Button>
        </form>
      </AdminDrawer>
    </div>
  );
}
