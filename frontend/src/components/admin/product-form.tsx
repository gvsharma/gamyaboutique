"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ColorPicker } from "@/components/admin/color-picker";
import { FormSection } from "@/components/admin/form-section";
import { ImageUploader } from "@/components/admin/image-uploader";
import { SizePicker } from "@/components/admin/size-picker";
import { VideoUploader } from "@/components/admin/video-uploader";
import {
  categoryOptionLabel,
  productAssignableCategories,
} from "@/constants/category-taxonomy";
import { ROUTES } from "@/constants/routes";
import { extractApiErrorMessage } from "@/lib/api/error-message";
import {
  createProduct,
  fetchAdminCategories,
  fetchFabrics,
  fetchPrints,
  updateProduct,
} from "@/lib/api/services/admin.service";
import { generateProductSku } from "@/lib/generate-product-sku";
import type {
  AdminCategory,
  ProductDetail,
  ProductImageInput,
  ProductStatus,
  TaxonomyOption,
  UpsertProductPayload,
} from "@/types/admin";
import type { ProductColor } from "@/types/product";

const inputClass = "admin-input";
const labelClass = "text-eyebrow text-stone";
const DRAFT_KEY = "gamya-admin-product-draft";

interface ProductDraft {
  sku: string;
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  status: ProductStatus;
  primaryCategoryId: string;
  fabricId: string;
  printId: string;
  stockQuantity: string;
  lowStockThreshold: string;
  images: ProductImageInput[];
  videoUrl: string | null;
  availableSizes: string[];
  availableColors: ProductColor[];
}

interface ProductFormProps {
  product?: ProductDetail;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
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
  const [availableSizes, setAvailableSizes] = useState<string[]>(product?.availableSizes ?? []);
  const [availableColors, setAvailableColors] = useState<ProductColor[]>(
    product?.availableColors ?? [],
  );

  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as ProductDraft;
      setSku(draft.sku ?? "");
      setName(draft.name ?? "");
      setDescription(draft.description ?? "");
      setPrice(draft.price ?? "");
      setCompareAtPrice(draft.compareAtPrice ?? "");
      setStatus(draft.status ?? "DRAFT");
      setPrimaryCategoryId(draft.primaryCategoryId ?? "");
      setFabricId(draft.fabricId ?? "");
      setPrintId(draft.printId ?? "");
      setStockQuantity(draft.stockQuantity ?? "");
      setLowStockThreshold(draft.lowStockThreshold ?? "5");
      setImages(draft.images ?? []);
      setVideoUrl(draft.videoUrl ?? null);
      setAvailableSizes(draft.availableSizes ?? []);
      setAvailableColors(draft.availableColors ?? []);
    } catch {
      /* ignore corrupt draft */
    }
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) return;
    const timer = window.setTimeout(() => {
      const draft: ProductDraft = {
        sku,
        name,
        description,
        price,
        compareAtPrice,
        status,
        primaryCategoryId,
        fabricId,
        printId,
        stockQuantity,
        lowStockThreshold,
        images,
        videoUrl,
        availableSizes,
        availableColors,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [
    isEdit,
    sku,
    name,
    description,
    price,
    compareAtPrice,
    status,
    primaryCategoryId,
    fabricId,
    printId,
    stockQuantity,
    lowStockThreshold,
    images,
    videoUrl,
    availableSizes,
    availableColors,
  ]);

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
      if (catsResult.status === "fulfilled") setCategories(catsResult.value);
      else failures.push("categories");
      if (fabricsResult.status === "fulfilled") setFabrics(fabricsResult.value);
      else failures.push("fabrics");
      if (printsResult.status === "fulfilled") setPrints(printsResult.value);
      else failures.push("prints");
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

  const buildPayload = useCallback((): UpsertProductPayload => {
    const trimmedSku = sku.trim();
    const resolvedSku =
      isEdit || trimmedSku
        ? trimmedSku
        : generateProductSku(name, primaryCategoryId, categories);
    const parsedPrice = Number(price);

    return {
      sku: resolvedSku,
      name: name.trim(),
      description: description || undefined,
      price: parsedPrice,
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
      availableSizes: availableSizes.length ? availableSizes : undefined,
      availableColors: availableColors.length ? availableColors : undefined,
    };
  }, [
    isEdit,
    sku,
    name,
    description,
    price,
    compareAtPrice,
    status,
    primaryCategoryId,
    fabricId,
    printId,
    images,
    videoUrl,
    stockQuantity,
    lowStockThreshold,
    availableSizes,
    availableColors,
    categories,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryCategoryId) {
      setError("Select a product type under Women or Girls (e.g. Sarees, Kurtas).");
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
      const payload = buildPayload();
      if (isEdit && product) {
        await updateProduct(product.id, payload);
        toast("Product updated");
      } else {
        await createProduct(payload);
        localStorage.removeItem(DRAFT_KEY);
        toast("Product created");
      }
      router.push(ROUTES.admin.products);
    } catch (err) {
      const message = extractApiErrorMessage(err, "Failed to save product.");
      setError(message);
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <p className="text-xs text-stone">Draft auto-saves locally while you work.</p>
      )}

      <FormSection title="Media" description="Images and video — upload before saving">
        <div>
          <label className={labelClass}>Product images</label>
          <div className="mt-2">
            <ImageUploader images={images} onChange={setImages} productName={name} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Product video</label>
          <div className="mt-2">
            <VideoUploader videoUrl={videoUrl} onChange={setVideoUrl} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Basics" description="Name, description, and category">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>SKU</label>
            <input
              className={inputClass}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required={isEdit}
              placeholder={isEdit ? undefined : "Leave blank to auto-generate"}
            />
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
        </div>
      </FormSection>

      <FormSection title="Pricing & inventory">
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </FormSection>

      <FormSection title="Sizes & colors" description="What customers can pick on the product page">
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Available sizes</label>
            <div className="mt-2">
              <SizePicker value={availableSizes} onChange={setAvailableSizes} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Available colors</label>
            <div className="mt-2">
              <ColorPicker value={availableColors} onChange={setAvailableColors} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Taxonomy" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
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
      </FormSection>

      {error && <p className="text-sm text-maroon">{error}</p>}

      <div className="admin-card flex flex-wrap gap-3">
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
