"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VideoUploader } from "@/components/admin/video-uploader";
import {
  categoryOptionLabel,
  productAssignableCategories,
} from "@/constants/category-taxonomy";
import { ROUTES } from "@/constants/routes";
import {
  createProduct,
  fetchAdminCategories,
  fetchFabrics,
  fetchPrints,
  updateProduct,
} from "@/lib/api/services/admin.service";
import type {
  AdminCategory,
  ProductDetail,
  ProductImageInput,
  ProductStatus,
  TaxonomyOption,
  UpsertProductPayload,
} from "@/types/admin";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";

interface ProductFormProps {
  product?: ProductDetail;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [fabrics, setFabrics] = useState<TaxonomyOption[]>([]);
  const [prints, setPrints] = useState<TaxonomyOption[]>([]);

  const [sku, setSku] = useState(product?.sku ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice?.toString() ?? "",
  );
  const [status, setStatus] = useState<ProductStatus>(
    (product?.status as ProductStatus) ?? "DRAFT",
  );
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    product?.primaryCategoryId ?? "",
  );
  const [fabricId, setFabricId] = useState(product?.fabric?.id ?? "");
  const [printId, setPrintId] = useState(product?.print?.id ?? "");
  const [stockQuantity, setStockQuantity] = useState(
    product?.stockQuantity != null ? String(product.stockQuantity) : "",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    product?.lowStockThreshold != null ? String(product.lowStockThreshold) : "5",
  );
  const [images, setImages] = useState<ProductImageInput[]>(
    product?.images?.map((img, index) => ({
      url: img.url,
      altText: img.altText ?? undefined,
      displayOrder: img.displayOrder ?? index,
    })) ?? [],
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(product?.videoUrl ?? null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [catsResult, fabricsResult, printsResult] = await Promise.allSettled([
        fetchAdminCategories(),
        fetchFabrics(),
        fetchPrints(),
      ]);
      if (cancelled) return;
      const failures: string[] = [];
      if (catsResult.status === "fulfilled") {
        setCategories(catsResult.value);
      } else {
        failures.push("categories");
      }
      if (fabricsResult.status === "fulfilled") {
        setFabrics(fabricsResult.value);
      } else {
        failures.push("fabrics");
      }
      if (printsResult.status === "fulfilled") {
        setPrints(printsResult.value);
      } else {
        failures.push("prints");
      }
      if (failures.length > 0) {
        setError(`Failed to load form options: ${failures.join(", ")}. Try refreshing.`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const assignableCategories = useMemo(
    () => productAssignableCategories(categories),
    [categories],
  );

  const buildPayload = (): UpsertProductPayload => ({
    sku,
    name,
    description: description || undefined,
    price: Number(price),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
    currency: "INR",
    status,
    primaryCategoryId: primaryCategoryId || null,
    fabricId: fabricId || null,
    printId: printId || null,
    categoryIds: primaryCategoryId ? [primaryCategoryId] : [],
    images,
    videoUrl: videoUrl || null,
    stockQuantity: stockQuantity ? Number(stockQuantity) : null,
    lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryCategoryId) {
      setError("Select a product type under Women or Girls (e.g. Sarees, Kurtas).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      if (isEdit && product) {
        await updateProduct(product.id, payload);
        router.push(ROUTES.admin.products);
      } else {
        const created = await createProduct(payload);
        router.push(ROUTES.admin.productEdit(created.id));
      }
    } catch {
      setError("Failed to save product. Check SKU uniqueness and required fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>SKU</label>
          <input className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} min-h-24`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            required
          />
        </div>
        <div>
          <label className={labelClass}>Compare at price</label>
          <input
            className={inputClass}
            type="number"
            min="0.01"
            step="0.01"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Stock quantity</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            placeholder="Leave empty for made-to-order"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Low stock threshold</label>
          <input
            className={inputClass}
            type="number"
            min="1"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        </div>
        <div>
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
          <p className="mt-1 text-xs text-stone">
            Choose a specific type (Sarees, Kurtas, etc.). Products assigned only to Women or Girls
            will not appear in shop collections.
          </p>
        </div>
        <div>
          <label className={labelClass}>Fabric</label>
          <select className={inputClass} value={fabricId} onChange={(e) => setFabricId(e.target.value)}>
            <option value="">— Select —</option>
            {fabrics.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Print</label>
          <select className={inputClass} value={printId} onChange={(e) => setPrintId(e.target.value)}>
            <option value="">— Select —</option>
            {prints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Product images (S3)</label>
        <div className="mt-2">
          <ImageUploader images={images} onChange={setImages} productName={name} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Product video (S3)</label>
        <div className="mt-2">
          <VideoUploader videoUrl={videoUrl} onChange={setVideoUrl} />
        </div>
      </div>

      {error && <p className="text-sm text-maroon">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Update product" : "Create product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.admin.products)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
