"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCategory } from "@/lib/api/services/admin.service";
import type { AdminCategory, UpsertCategoryPayload } from "@/types/admin";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

interface CategoryFormProps {
  categories: AdminCategory[];
  onCreated: () => void;
}

export function CategoryForm({ categories, onCreated }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: UpsertCategoryPayload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      parentId: parentId || null,
      displayOrder: Number(displayOrder),
      active: true,
    };
    try {
      await createCategory(payload);
      setName("");
      setSlug("");
      setDescription("");
      setParentId("");
      setDisplayOrder("0");
      onCreated();
    } catch {
      setError("Failed to create category. Check slug uniqueness.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-4">
      <h3 className="font-display text-lg text-charcoal">Add category</h3>
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
        <div>
          <label className={labelClass}>Parent</label>
          <select className={inputClass} value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— Root —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Display order</label>
          <input
            className={inputClass}
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-maroon">{error}</p>}
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Creating…" : "Create category"}
      </Button>
    </form>
  );
}
