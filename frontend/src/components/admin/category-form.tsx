"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ALLOWED_ROOT_SLUGS,
  GIRLS_CHILD_SLUGS,
  WOMEN_CHILD_SLUGS,
  adminVisibleCategories,
} from "@/constants/category-taxonomy";
import { createCategory } from "@/lib/api/services/admin.service";
import type { AdminCategory, UpsertCategoryPayload } from "@/types/admin";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

interface CategoryFormProps {
  categories: AdminCategory[];
  onCreated: () => void;
}

export function CategoryForm({ categories, onCreated }: CategoryFormProps) {
  const visibleRoots = useMemo(
    () =>
      categories.filter(
        (c) => !c.parentId && (ALLOWED_ROOT_SLUGS as readonly string[]).includes(c.slug),
      ),
    [categories],
  );

  const [parentId, setParentId] = useState("");
  const [childSlug, setChildSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parent = categories.find((c) => c.id === parentId);
  const childOptions =
    parent?.slug === "women"
      ? WOMEN_CHILD_SLUGS
      : parent?.slug === "girls"
        ? GIRLS_CHILD_SLUGS
        : [];

  const existingChild =
    parent && childSlug
      ? categories.find((c) => c.parentId === parent.id && c.slug === childSlug)
      : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId || !childSlug) {
      setError("Select Women or Girls, then a product type.");
      return;
    }
    if (existingChild) {
      setError("This category already exists.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: UpsertCategoryPayload = {
      name: name.trim(),
      slug: childSlug,
      description: description || undefined,
      parentId,
      displayOrder: Number(displayOrder),
      active: true,
    };
    try {
      await createCategory(payload);
      setName("");
      setDescription("");
      setParentId("");
      setChildSlug("");
      setDisplayOrder("0");
      onCreated();
    } catch {
      setError("Failed to create category. Only Women and Girls types are allowed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-4">
      <h3 className="font-display text-lg text-charcoal">Add category</h3>
      <p className="text-sm text-stone">
        Taxonomy is limited to Women (sarees, kurtas, lehengas, blouses) and Girls (kurtas,
        lehengas).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Group</label>
          <select
            className={inputClass}
            value={parentId}
            onChange={(e) => {
              setParentId(e.target.value);
              setChildSlug("");
            }}
            required
          >
            <option value="">— Women or Girls —</option>
            {visibleRoots.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select
            className={inputClass}
            value={childSlug}
            onChange={(e) => setChildSlug(e.target.value)}
            required
            disabled={!parentId}
          >
            <option value="">— Select type —</option>
            {childOptions.map((slug) => {
              const taken = Boolean(
                parent && categories.some((c) => c.parentId === parent.id && c.slug === slug),
              );
              return (
                <option key={slug} value={slug} disabled={taken}>
                  {slug.replace(/-/g, " ")}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className={labelClass}>Display name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
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
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-maroon">{error}</p>}
      <Button type="submit" size="sm" disabled={saving || Boolean(existingChild)}>
        {saving ? "Creating…" : "Create category"}
      </Button>
    </form>
  );
}

export { adminVisibleCategories };
