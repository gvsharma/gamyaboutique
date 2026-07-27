"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminDrawer } from "@/components/ui/admin-drawer";
import { useToast } from "@/components/ui/toast";
import { CatalogImage } from "@/components/ui/catalog-image";
import { CategoryForm } from "@/components/admin/category-form";
import { CoverImageUploader } from "@/components/admin/cover-image-uploader";
import { adminVisibleCategories } from "@/constants/category-taxonomy";
import {
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
  uploadCategoryImage,
} from "@/lib/api/services/admin.service";
import { categoryCoverImage } from "@/lib/category-images";
import type { AdminCategory, UpsertCategoryPayload } from "@/types/admin";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchAdminCategories,
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description ?? "");
    setParentId(cat.parentId ?? "");
    setDisplayOrder(String(cat.displayOrder));
    setImageUrl(cat.imageUrl ?? null);
  };

  const closeEdit = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setDisplayOrder("0");
    setImageUrl(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setActionError(null);
    const payload: UpsertCategoryPayload = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      parentId: parentId || null,
      displayOrder: Number(displayOrder),
      active: true,
      imageUrl,
    };
    try {
      await updateCategory(editing.id, payload);
      toast("Category updated");
      closeEdit();
      await refetch();
    } catch {
      setActionError("Failed to update category.");
      toast("Failed to update category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this category?")) return;
    setActionError(null);
    try {
      await deleteCategory(id);
      await refetch();
    } catch {
      setActionError("Failed to deactivate category.");
    }
  };

  const visibleCategories = adminVisibleCategories<AdminCategory>(data ?? []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Catalog</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Categories</h1>
        <p className="mt-1 text-sm text-stone">
          Women and Girls taxonomy only — assign products to leaf types (Sarees, Kurtas, etc.)
        </p>
      </div>

      <CategoryForm categories={data ?? []} onCreated={() => refetch()} />

      {editing && (
        <AdminDrawer open={Boolean(editing)} title="Edit category" onClose={closeEdit}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Slug</label>
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
                  {visibleCategories
                    .filter((c) => c.id !== editing.id)
                    .map((cat) => (
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
              <div className="sm:col-span-2">
                <label className={labelClass}>Cover image</label>
                <div className="mt-2">
                  <CoverImageUploader
                    imageUrl={imageUrl}
                    onChange={setImageUrl}
                    upload={uploadCategoryImage}
                    slug={slug}
                    alt={name || "Category cover"}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </AdminDrawer>
      )}

      {actionError && <p className="text-sm text-maroon">{actionError}</p>}
      {isLoading && <p className="text-sm text-stone">Loading categories…</p>}
      {isError && <p className="text-sm text-maroon">Failed to load categories.</p>}

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-5 py-3.5">Cover</th>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Slug</th>
              <th className="px-5 py-3.5">Parent</th>
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleCategories.map((cat) => {
              const parent = data?.find((p) => p.id === cat.parentId);
              return (
                <tr key={cat.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-charcoal/10 bg-pearl">
                      <CatalogImage
                        src={categoryCoverImage(cat.slug, cat.imageUrl)}
                        fallbackSrc={categoryCoverImage(cat.slug)}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-charcoal">{cat.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-stone">{cat.slug}</td>
                  <td className="px-5 py-3.5 text-stone">{parent?.name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-stone">{cat.displayOrder}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeactivate(cat.id)}>
                        Deactivate
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
