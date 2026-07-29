"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  categoryOptionLabel,
  productAssignableCategories,
} from "@/constants/category-taxonomy";
import { ROUTES } from "@/constants/routes";
import { extractApiErrorMessage } from "@/lib/api/error-message";
import { createProduct, fetchAdminCategories } from "@/lib/api/services/admin.service";
import { generateProductSku } from "@/lib/generate-product-sku";
import type { AdminCategory } from "@/types/admin";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

export function QuickProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [primaryCategoryId, setPrimaryCategoryId] = useState("");

  useEffect(() => {
    fetchAdminCategories()
      .then(setCategories)
      .catch(() => setError("Failed to load product types. Try refreshing."));
  }, []);

  const assignableCategories = useMemo(
    () => productAssignableCategories(categories),
    [categories],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!primaryCategoryId) {
      setError("Select a product type (e.g. Sarees, Kurtas).");
      return;
    }
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0.01) {
      setError("Enter a valid price (minimum ₹0.01).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createProduct({
        sku: generateProductSku(name, primaryCategoryId, categories),
        name: name.trim(),
        description: description || undefined,
        price: parsedPrice,
        currency: "INR",
        status: "DRAFT",
        primaryCategoryId,
        categoryIds: [primaryCategoryId],
        images: [],
        stockQuantity: null,
        lowStockThreshold: 5,
      });
      toast("Product created — add photos and video next");
      router.push(ROUTES.admin.productEdit(created.id));
    } catch (err) {
      const message = extractApiErrorMessage(err, "Failed to create product.");
      setError(message);
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-card space-y-4">
        <p className="text-sm text-stone">
          Only four fields needed. SKU, status, and inventory use sensible defaults. After saving,
          you&apos;ll go to the edit page to upload images and video.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Royal Banarasi Saree"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Product type</label>
            <select
              className={inputClass}
              value={primaryCategoryId}
              onChange={(e) => setPrimaryCategoryId(e.target.value)}
              required
            >
              <option value="">— Select type —</option>
              {assignableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {categoryOptionLabel(cat, categories)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-24`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — fabric, occasion, styling notes…"
            />
          </div>
          <div>
            <label className={labelClass}>Price (INR)</label>
            <input
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="28999"
              required
            />
          </div>
        </div>
        <p className="text-xs text-stone">
          Defaults: draft status, INR, made-to-order (no stock cap), low-stock alert at 5. SKU is
          generated automatically.
        </p>
      </div>

      {error && <p className="text-sm text-maroon">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create & add photos"}
        </Button>
        <Link href={`${ROUTES.admin.productNew}?mode=full`}>
          <Button type="button" variant="outline">
            Full form (SKU, sizes, fabric…)
          </Button>
        </Link>
        <Link href={ROUTES.admin.productImport}>
          <Button type="button" variant="outline">
            Import CSV / Excel
          </Button>
        </Link>
      </div>
    </form>
  );
}
