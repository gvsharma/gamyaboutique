"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createFabric,
  createOffer,
  createPrint,
  createTag,
  deleteFabric,
  deleteOffer,
  deletePrint,
  deleteTag,
  fetchAdminFabrics,
  fetchAdminOffers,
  fetchAdminPrints,
  fetchAdminTags,
  updateFabric,
  updateOffer,
  updatePrint,
  updateTag,
} from "@/lib/api/services/admin.service";
import type {
  AdminFabric,
  AdminOffer,
  AdminPrint,
  AdminTag,
  DiscountType,
  TagType,
  UpsertFabricPayload,
  UpsertOfferPayload,
  UpsertPrintPayload,
  UpsertTagPayload,
} from "@/types/admin";
import { cn } from "@/lib/utils";

type Tab = "fabrics" | "prints" | "tags" | "offers";

const TABS: { id: Tab; label: string }[] = [
  { id: "fabrics", label: "Fabrics" },
  { id: "prints", label: "Prints" },
  { id: "tags", label: "Tags" },
  { id: "offers", label: "Offers" },
];

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

export default function AdminTaxonomyPage() {
  const [tab, setTab] = useState<Tab>("fabrics");
  const [error, setError] = useState<string | null>(null);
  const [editingFabric, setEditingFabric] = useState<AdminFabric | null>(null);
  const [editingPrint, setEditingPrint] = useState<AdminPrint | null>(null);
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [editingOffer, setEditingOffer] = useState<AdminOffer | null>(null);

  const fabrics = useQuery({ queryKey: ["admin", "taxonomy", "fabrics"], queryFn: fetchAdminFabrics });
  const prints = useQuery({ queryKey: ["admin", "taxonomy", "prints"], queryFn: fetchAdminPrints });
  const tags = useQuery({ queryKey: ["admin", "taxonomy", "tags"], queryFn: fetchAdminTags });
  const offers = useQuery({ queryKey: ["admin", "taxonomy", "offers"], queryFn: fetchAdminOffers });

  const refetch = () => {
    fabrics.refetch();
    prints.refetch();
    tags.refetch();
    offers.refetch();
  };

  const handleDeactivate = async (type: Tab, id: string) => {
    if (!confirm("Deactivate this item?")) return;
    setError(null);
    try {
      if (type === "fabrics") await deleteFabric(id);
      else if (type === "prints") await deletePrint(id);
      else if (type === "tags") await deleteTag(id);
      else await deleteOffer(id);
      refetch();
    } catch {
      setError("Failed to deactivate item.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Catalog</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Taxonomy</h1>
        <p className="mt-1 text-sm text-stone">Fabrics, prints, tags, and offers</p>
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

      {error && <p className="text-sm text-maroon">{error}</p>}

      {tab === "fabrics" && (
        <>
          <FabricForm
            editing={editingFabric}
            onCancel={() => setEditingFabric(null)}
            onSaved={() => {
              setEditingFabric(null);
              fabrics.refetch();
            }}
          />
          <TaxonomyTable
            loading={fabrics.isLoading}
            rows={fabrics.data?.map((f) => [f.name, f.slug, f.active ? "Active" : "Inactive"]) ?? []}
            headers={["Name", "Slug", "Status"]}
            onEdit={(i) => setEditingFabric(fabrics.data![i])}
            onDelete={(i) => handleDeactivate("fabrics", fabrics.data![i].id)}
          />
        </>
      )}

      {tab === "prints" && (
        <>
          <PrintForm
            editing={editingPrint}
            onCancel={() => setEditingPrint(null)}
            onSaved={() => {
              setEditingPrint(null);
              prints.refetch();
            }}
          />
          <TaxonomyTable
            loading={prints.isLoading}
            rows={prints.data?.map((p) => [p.name, p.slug, p.active ? "Active" : "Inactive"]) ?? []}
            headers={["Name", "Slug", "Status"]}
            onEdit={(i) => setEditingPrint(prints.data![i])}
            onDelete={(i) => handleDeactivate("prints", prints.data![i].id)}
          />
        </>
      )}

      {tab === "tags" && (
        <>
          <TagForm
            editing={editingTag}
            onCancel={() => setEditingTag(null)}
            onSaved={() => {
              setEditingTag(null);
              tags.refetch();
            }}
          />
          <TaxonomyTable
            loading={tags.isLoading}
            rows={tags.data?.map((t) => [t.name, t.slug, t.tagType]) ?? []}
            headers={["Name", "Slug", "Type"]}
            onEdit={(i) => setEditingTag(tags.data![i])}
            onDelete={(i) => handleDeactivate("tags", tags.data![i].id)}
          />
        </>
      )}

      {tab === "offers" && (
        <>
          <OfferForm
            editing={editingOffer}
            onCancel={() => setEditingOffer(null)}
            onSaved={() => {
              setEditingOffer(null);
              offers.refetch();
            }}
          />
          <TaxonomyTable
            loading={offers.isLoading}
            rows={
              offers.data?.map((o) => [
                o.name,
                o.code ?? "—",
                `${o.discountType} ${o.discountValue}`,
                o.active ? "Active" : "Inactive",
              ]) ?? []
            }
            headers={["Name", "Code", "Discount", "Status"]}
            onEdit={(i) => setEditingOffer(offers.data![i])}
            onDelete={(i) => handleDeactivate("offers", offers.data![i].id)}
          />
        </>
      )}
    </div>
  );
}

function TaxonomyTable({
  headers,
  rows,
  loading,
  onEdit,
  onDelete,
}: {
  headers: string[];
  rows: string[][];
  loading: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}) {
  if (loading) return <p className="text-sm text-stone">Loading…</p>;
  return (
    <div className="admin-card overflow-x-auto !p-0">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-5 py-3.5">
                {h}
              </th>
            ))}
            <th className="px-5 py-3.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-charcoal/5 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3.5 text-charcoal">
                  {cell}
                </td>
              ))}
              <td className="px-5 py-3.5">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(i)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(i)}>
                    Deactivate
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="px-5 py-10 text-center text-sm text-stone">No items.</p>}
    </div>
  );
}

function FabricForm({
  editing,
  onCancel,
  onSaved,
}: {
  editing: AdminFabric | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [composition, setComposition] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = (f?: AdminFabric) => {
    setName(f?.name ?? "");
    setSlug(f?.slug ?? "");
    setDescription(f?.description ?? "");
    setComposition(f?.composition ?? "");
  };

  useEffect(() => {
    reset(editing ?? undefined);
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: UpsertFabricPayload = { name, slug: slug || undefined, description, composition };
    try {
      if (editing) await updateFabric(editing.id, payload);
      else await createFabric(payload);
      reset();
      onSaved();
    } catch {
      alert("Failed to save fabric.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="admin-card space-y-3">
      <h3 className="font-display text-lg text-charcoal">{editing ? "Edit fabric" : "Add fabric"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Slug (optional)</label>
          <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Composition</label>
          <input className={inputClass} value={composition} onChange={(e) => setComposition(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editing ? "Update" : "Create"}
        </Button>
        {editing && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function PrintForm({
  editing,
  onCancel,
  onSaved,
}: {
  editing: AdminPrint | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [patternType, setPatternType] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = (p?: AdminPrint) => {
    setName(p?.name ?? "");
    setSlug(p?.slug ?? "");
    setDescription(p?.description ?? "");
    setPatternType(p?.patternType ?? "");
  };

  useEffect(() => {
    reset(editing ?? undefined);
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: UpsertPrintPayload = { name, slug: slug || undefined, description, patternType };
    try {
      if (editing) await updatePrint(editing.id, payload);
      else await createPrint(payload);
      reset();
      onSaved();
    } catch {
      alert("Failed to save print.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="admin-card space-y-3">
      <h3 className="font-display text-lg text-charcoal">{editing ? "Edit print" : "Add print"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Slug (optional)</label>
          <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Pattern type</label>
          <input className={inputClass} value={patternType} onChange={(e) => setPatternType(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editing ? "Update" : "Create"}
        </Button>
        {editing && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function TagForm({
  editing,
  onCancel,
  onSaved,
}: {
  editing: AdminTag | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagType, setTagType] = useState<TagType>("GENERAL");
  const [saving, setSaving] = useState(false);

  const reset = (t?: AdminTag) => {
    setName(t?.name ?? "");
    setSlug(t?.slug ?? "");
    setTagType(t?.tagType ?? "GENERAL");
  };

  useEffect(() => {
    reset(editing ?? undefined);
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: UpsertTagPayload = { name, slug: slug || undefined, tagType };
    try {
      if (editing) await updateTag(editing.id, payload);
      else await createTag(payload);
      reset();
      onSaved();
    } catch {
      alert("Failed to save tag.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="admin-card space-y-3">
      <h3 className="font-display text-lg text-charcoal">{editing ? "Edit tag" : "Add tag"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Slug (optional)</label>
          <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select className={inputClass} value={tagType} onChange={(e) => setTagType(e.target.value as TagType)}>
            <option value="GENERAL">GENERAL</option>
            <option value="OFFER">OFFER</option>
            <option value="SEASONAL">SEASONAL</option>
            <option value="FEATURE">FEATURE</option>
            <option value="COLLECTION">COLLECTION</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editing ? "Update" : "Create"}
        </Button>
        {editing && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function OfferForm({
  editing,
  onCancel,
  onSaved,
}: {
  editing: AdminOffer | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENT");
  const [discountValue, setDiscountValue] = useState("10");
  const [saving, setSaving] = useState(false);

  const reset = (o?: AdminOffer) => {
    setName(o?.name ?? "");
    setCode(o?.code ?? "");
    setDescription(o?.description ?? "");
    setDiscountType(o?.discountType ?? "PERCENT");
    setDiscountValue(o ? String(o.discountValue) : "10");
  };

  useEffect(() => {
    reset(editing ?? undefined);
  }, [editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: UpsertOfferPayload = {
      name,
      code: code || undefined,
      description,
      discountType,
      discountValue: Number(discountValue),
    };
    try {
      if (editing) await updateOffer(editing.id, payload);
      else await createOffer(payload);
      reset();
      onSaved();
    } catch {
      alert("Failed to save offer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="admin-card space-y-3">
      <h3 className="font-display text-lg text-charcoal">{editing ? "Edit offer" : "Add offer"}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Code</label>
          <input className={inputClass} value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Discount type</label>
          <select
            className={inputClass}
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
          >
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Discount value</label>
          <input
            className={inputClass}
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving…" : editing ? "Update" : "Create"}
        </Button>
        {editing && (
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
