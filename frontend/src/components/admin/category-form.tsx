"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCategory } from "@/lib/api/services/admin.service";
import type { AdminCategory, UpsertCategoryPayload } from "@/types/admin";

const inputClass =
  "mt-1 w-full rounded-sm border border-burgundy/20 bg-white px-3 py-2.5 text-sm";

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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-burgundy/10 bg-cream p-4">
      <h3 className="font-display text-lg text-burgundy">Add category</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wider text-stone">Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-stone">Slug (optional)</label>
          <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs uppercase tracking-wider text-stone">Description</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-stone">Parent</label>
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
          <label className="text-xs uppercase tracking-wider text-stone">Display order</label>
          <input
            className={inputClass}
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-burgundy">{error}</p>}
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Creating…" : "Create category"}
      </Button>
    </form>
  );
}
