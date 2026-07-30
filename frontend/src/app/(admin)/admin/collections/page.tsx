"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CoverImageUploader } from "@/components/admin/cover-image-uploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  createCollection,
  deactivateCollection,
  fetchAdminCollections,
  updateCollection,
  uploadCollectionImage,
} from "@/lib/api/services/admin.service";
import type { AdminCollection, CollectionType, UpsertCollectionPayload } from "@/types/admin";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

const COLLECTION_TYPES: { value: CollectionType; label: string }[] = [
  { value: "EVENT", label: "Event (wedding, festival, occasion)" },
  { value: "TREND", label: "Trend (style edit, trending now)" },
  { value: "SEASON", label: "Season (spring, monsoon, festive season)" },
  { value: "FEATURED", label: "Featured (homepage spotlight)" },
];

const emptyForm = (): UpsertCollectionPayload & { id?: string } => ({
  name: "",
  slug: "",
  collectionType: "EVENT",
  description: "",
  startsAt: null,
  endsAt: null,
  imageUrl: null,
  displayOrder: 0,
  active: true,
});

function typeLabel(type: CollectionType): string {
  return COLLECTION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function AdminCollectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState<string | null>(null);

  const collections = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: fetchAdminCollections,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: UpsertCollectionPayload = {
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        collectionType: form.collectionType,
        description: form.description?.trim() || undefined,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        imageUrl: form.imageUrl || null,
        displayOrder: form.displayOrder ?? 0,
        active: form.active ?? true,
      };
      if (form.id) {
        return updateCollection(form.id, payload);
      }
      return createCollection(payload);
    },
    onSuccess: () => {
      invalidate();
      setForm(emptyForm());
      setError(null);
      toast(form.id ? "Collection updated" : "Collection created");
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to save collection.");
      toast("Failed to save collection", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deactivateCollection,
    onSuccess: () => {
      invalidate();
      toast("Collection deactivated");
      if (form.id) setForm(emptyForm());
    },
    onError: () => toast("Failed to deactivate collection", "error"),
  });

  const startEdit = (collection: AdminCollection) => {
    setForm({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      collectionType: collection.collectionType,
      description: collection.description ?? "",
      startsAt: collection.startsAt,
      endsAt: collection.endsAt,
      imageUrl: collection.imageUrl,
      displayOrder: collection.displayOrder,
      active: collection.active,
    });
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Merchandising</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Collections</h1>
        <p className="mt-1 text-sm text-stone">
          Group products for events, trends, seasons, and homepage features. Assign collections on
          each product.
        </p>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-display text-lg text-charcoal">
          {form.id ? "Edit collection" : "Add collection"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Diwali Festive Edit"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug (optional)</label>
            <input
              className={inputClass}
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="diwali-festive-2026"
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              className={inputClass}
              value={form.collectionType}
              onChange={(e) =>
                setForm({ ...form, collectionType: e.target.value as CollectionType })
              }
            >
              {COLLECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Display order</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.displayOrder ?? 0}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass}>Start date (optional)</label>
            <input
              className={inputClass}
              type="date"
              value={form.startsAt ?? ""}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value || null })}
            />
          </div>
          <div>
            <label className={labelClass}>End date (optional)</label>
            <input
              className={inputClass}
              type="date"
              value={form.endsAt ?? ""}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value || null })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-20`}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short copy for the collection landing page"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Hero image</label>
            <div className="mt-2">
              <CoverImageUploader
                imageUrl={form.imageUrl ?? null}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                upload={uploadCollectionImage}
                slug={form.slug}
                alt={form.name || "Collection cover"}
              />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active on storefront
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-maroon">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !form.name.trim()}
          >
            {saveMutation.isPending ? "Saving…" : form.id ? "Update collection" : "Create collection"}
          </Button>
          {form.id && (
            <Button type="button" variant="outline" onClick={() => setForm(emptyForm())}>
              Cancel edit
            </Button>
          )}
        </div>
      </div>

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-stone">Loading…</td>
              </tr>
            ) : collections.data?.length ? (
              collections.data.map((collection) => (
                <tr key={collection.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-4 py-3 text-stone">{collection.displayOrder}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">{collection.name}</p>
                    <p className="text-xs text-stone">{collection.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-stone">{typeLabel(collection.collectionType)}</td>
                  <td className="px-4 py-3 text-xs text-stone">
                    {collection.startsAt ?? "—"} → {collection.endsAt ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="chip">{collection.active ? "Active" : "Hidden"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(collection)}
                        className="text-maroon hover:underline"
                        aria-label={`Edit ${collection.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deactivate "${collection.name}"?`)) {
                            deleteMutation.mutate(collection.id);
                          }
                        }}
                        className="text-maroon hover:underline"
                        aria-label={`Deactivate ${collection.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-stone">
                  No collections yet. Create an event or trend collection above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
