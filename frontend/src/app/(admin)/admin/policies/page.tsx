"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchAdminPolicies,
  updateAdminPolicy,
} from "@/lib/api/services/admin.service";
import type { PolicyKey, SitePolicy, UpdateSitePolicyPayload } from "@/types/site-policy";
import { cn } from "@/lib/utils";

const TABS: { id: PolicyKey; label: string }[] = [
  { id: "privacy", label: "Privacy" },
  { id: "shipping", label: "Shipping" },
  { id: "return", label: "Return" },
  { id: "terms", label: "Terms" },
];

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPoliciesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<PolicyKey>("privacy");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const policies = useQuery({
    queryKey: ["admin", "policies"],
    queryFn: fetchAdminPolicies,
  });

  const activePolicy = policies.data?.find((p) => p.key === tab);

  useEffect(() => {
    if (activePolicy) {
      setTitle(activePolicy.title);
      setContent(activePolicy.content);
      setSaved(false);
    }
  }, [activePolicy]);

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateSitePolicyPayload) => updateAdminPolicy(tab, payload),
    onSuccess: (updated: SitePolicy) => {
      queryClient.setQueryData<SitePolicy[]>(["admin", "policies"], (current) =>
        current?.map((p) => (p.key === updated.key ? updated : p)),
      );
      setSaved(true);
      setError(null);
    },
    onError: () => setError("Failed to save policy."),
  });

  const handleSave = () => {
    setError(null);
    setSaved(false);
    saveMutation.mutate({ title: title.trim(), content: content.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Content</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Site policies</h1>
        <p className="mt-1 text-sm text-stone">Legal and policy pages shown on the storefront</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm transition-all",
              tab === t.id ? "bg-maroon text-pearl" : "bg-pearl text-charcoal hover:bg-ivory",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {policies.isLoading ? (
        <p className="text-sm text-stone">Loading policies…</p>
      ) : policies.isError ? (
        <p className="text-sm text-red-600">Failed to load policies.</p>
      ) : (
        <div className="space-y-5 rounded-2xl bg-pearl p-6 shadow-soft">
          {activePolicy && (
            <p className="text-xs text-stone">Last updated: {formatUpdatedAt(activePolicy.updatedAt)}</p>
          )}

          <div className="space-y-2">
            <label htmlFor="policy-title" className={labelClass}>
              Title
            </label>
            <input
              id="policy-title"
              className={inputClass}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="policy-content" className={labelClass}>
              Content
            </label>
            <textarea
              id="policy-content"
              className={cn(inputClass, "min-h-[420px] resize-y font-mono text-sm leading-relaxed")}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaved(false);
              }}
            />
            <p className="text-xs text-stone">Plain text. Line breaks are preserved on the storefront.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-emerald-700">Policy saved.</p>}

          <Button type="button" onClick={handleSave} disabled={saveMutation.isPending || !title.trim() || !content.trim()}>
            {saveMutation.isPending ? "Saving…" : "Save policy"}
          </Button>
        </div>
      )}
    </div>
  );
}
