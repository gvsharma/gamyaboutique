"use client";

import { useMemo, useState } from "react";
import { FieldLabel } from "@/components/admin/field-label";
import { Button } from "@/components/ui/button";
import { CoverImageUploader } from "@/components/admin/cover-image-uploader";
import {
  ALLOWED_ROOT_SLUGS,
  GIRLS_CHILD_SLUGS,
  slugToDisplayName,
  WOMEN_CHILD_SLUGS,
} from "@/constants/category-taxonomy";
import { createCategory, uploadCategoryImage } from "@/lib/api/services/admin.service";
import type { AdminCategory, UpsertCategoryPayload } from "@/types/admin";

const inputClass = "admin-input";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
    if (!name.trim()) {
      setError("Add a display name.");
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
      description: description.trim() || undefined,
      parentId,
      displayOrder: Number(displayOrder),
      active: true,
      imageUrl: imageUrl || undefined,
    };
    try {
      await createCategory(payload);
      setName("");
      setDescription("");
      setParentId("");
      setChildSlug("");
      setDisplayOrder("0");
      setImageUrl(null);
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
        Pick Women or Girls and a type. Cover image is optional — drag from your Mac or add later.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Group</FieldLabel>
          <select
            className={inputClass}
            value={parentId}
            onChange={(e) => {
              setParentId(e.target.value);
              setChildSlug("");
            }}
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
          <FieldLabel>Type</FieldLabel>
          <select
            className={inputClass}
            value={childSlug}
            onChange={(e) => {
              const nextSlug = e.target.value;
              setChildSlug(nextSlug);
              if (nextSlug && !name.trim()) {
                setName(slugToDisplayName(nextSlug));
              }
            }}
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
                  {taken ? " (exists)" : ""}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <FieldLabel>Display name</FieldLabel>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarees"
          />
        </div>
        <div>
          <FieldLabel optional>Display order</FieldLabel>
          <input
            className={inputClass}
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel optional>Description</FieldLabel>
          <input
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description for navigation"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel optional>Cover image</FieldLabel>
          <div className="mt-2">
            <CoverImageUploader
              imageUrl={imageUrl}
              onChange={setImageUrl}
              upload={uploadCategoryImage}
              slug={childSlug || undefined}
              alt={name || "Category cover"}
            />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-maroon">{error}</p>}
      <Button type="submit" size="sm" disabled={saving || Boolean(existingChild)}>
        {saving ? "Creating…" : "Create category"}
      </Button>
    </form>
  );
}
