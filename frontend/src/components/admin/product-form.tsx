"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldLabel } from "@/components/admin/field-label";
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
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  createProduct,
  fetchAdminCategories,
  fetchAdminCollections,
  fetchAdminTags,
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
  AdminTag,
  AdminCollection,
} from "@/types/admin";
import type { ProductColor } from "@/types/product";

const inputClass = "admin-input";
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
  tagIds: string[];
  collectionIds: string[];
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
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);

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
  const [tagIds, setTagIds] = useState<string[]>(product?.tags?.map((t) => t.id) ?? []);
  const [collectionIds, setCollectionIds] = useState<string[]>(
    product?.collections?.map((c) => c.id) ?? [],
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
      setTagIds(draft.tagIds ?? []);
      setCollectionIds(draft.collectionIds ?? []);
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
        tagIds,
        collectionIds,
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
    tagIds,
    collectionIds,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [catsResult, fabricsResult, printsResult, tagsResult, collectionsResult] =
        await Promise.allSettled([
          fetchAdminCategories(),
          fetchFabrics(),
          fetchPrints(),
          fetchAdminTags(),
          fetchAdminCollections(),
        ]);
      if (cancelled) return;
      const failures: string[] = [];
      if (catsResult.status === "fulfilled") setCategories(catsResult.value);
      else failures.push("categories");
      if (fabricsResult.status === "fulfilled") setFabrics(fabricsResult.value);
      else failures.push("fabrics");
      if (printsResult.status === "fulfilled") setPrints(printsResult.value);
      else failures.push("prints");
      if (tagsResult.status === "fulfilled") setTags(tagsResult.value);
      else failures.push("tags");
      if (collectionsResult.status === "fulfilled") {
        setCollections(collectionsResult.value.filter((c) => c.active));
      } else failures.push("collections");
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

  const resolvedPrice = price.trim() ? Number(price) : 1;
  const isPlaceholderPrice = !price.trim() || resolvedPrice <= 1;

  const buildPayload = useCallback((): UpsertProductPayload => ({
    sku: sku.trim() || product?.sku || undefined,
    name: name.trim(),
    description: description.trim() || undefined,
    price: resolvedPrice,
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
    tagIds,
    collectionIds,
  }), [
    sku,
    name,
    description,
    resolvedPrice,
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
    tagIds,
    collectionIds,
    product?.sku,
  ]);

  const toggleId = (ids: string[], id: string): string[] =>
    ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];

  const validate = (): string | null => {
    if (!name.trim()) {
      return "Add a name — that's the only thing required to start a draft.";
    }
    if (status === "ACTIVE") {
      if (!primaryCategoryId) {
        return "Select a product type before publishing to the shop.";
      }
      if (isPlaceholderPrice) {
        return "Set a real price before publishing.";
      }
    }
    if (isEdit && !sku.trim()) {
      return "SKU is required when updating a product.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
        toast(
          status === "ACTIVE"
            ? "Product published"
            : "Draft saved — add photos and details anytime",
        );
      }
      router.push(ROUTES.admin.products);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Failed to save product. Check SKU uniqueness and required fields.",
      );
      setError(message);
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    if (!name.trim()) {
      setError("Add a name first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...buildPayload(), status: "DRAFT" as ProductStatus };
      if (isEdit && product) {
        await updateProduct(product.id, payload);
        toast("Draft saved");
        router.push(ROUTES.admin.products);
      } else {
        await createProduct(payload);
        localStorage.removeItem(DRAFT_KEY);
        toast("Draft saved — add photos and details anytime");
        router.push(ROUTES.admin.products);
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to save draft.");
      setError(message);
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <p className="text-sm text-stone">
          Start with a name and save a draft. Photos, video, price, and type can be added later.
          Draft auto-saves locally while you work.
        </p>
      )}

      <FormSection title="Basics" description="Name, type, and description">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Name</FieldLabel>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Banarasi Saree"
              autoFocus={!isEdit}
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel optional>Product type</FieldLabel>
            <select
              className={inputClass}
              value={primaryCategoryId}
              onChange={(e) => setPrimaryCategoryId(e.target.value)}
            >
              <option value="">Choose later — Sarees, Kurtas, Girls…</option>
              {assignableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {categoryOptionLabel(cat, categories)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel optional>Description</FieldLabel>
            <textarea
              className={`${inputClass} min-h-24`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fabric, occasion, styling notes…"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Photos & video"
        description="Drag and drop from your Mac — optional, add anytime"
      >
        <div>
          <FieldLabel optional>Product images</FieldLabel>
          <div className="mt-2">
            <ImageUploader images={images} onChange={setImages} productName={name} />
          </div>
        </div>
        <div>
          <FieldLabel optional>Product video</FieldLabel>
          <div className="mt-2">
            <VideoUploader videoUrl={videoUrl} onChange={setVideoUrl} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Pricing & inventory">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel optional hint="Required before publishing to the shop">
              Price (INR)
            </FieldLabel>
            <input
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="28999"
            />
          </div>
          <div>
            <FieldLabel optional>Compare at price</FieldLabel>
            <input
              className={inputClass}
              type="number"
              min="0.01"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="34999"
            />
          </div>
          <div>
            <FieldLabel optional>Stock quantity</FieldLabel>
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
            <FieldLabel optional>Low stock threshold</FieldLabel>
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

      <FormSection
        title="Sizes & colors"
        description="What customers can pick on the product page"
        defaultOpen={false}
      >
        <div className="space-y-5">
          <div>
            <FieldLabel optional>Available sizes</FieldLabel>
            <div className="mt-2">
              <SizePicker value={availableSizes} onChange={setAvailableSizes} />
            </div>
          </div>
          <div>
            <FieldLabel optional>Available colors</FieldLabel>
            <div className="mt-2">
              <ColorPicker value={availableColors} onChange={setAvailableColors} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Merchandising"
        description="Events, trends, and collections"
        defaultOpen={false}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <FieldLabel optional>Collections</FieldLabel>
            {collections.length === 0 ? (
              <p className="mt-2 text-sm text-stone">
                No active collections. Create one under Admin → Collections.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {collections.map((collection) => (
                  <li key={collection.id}>
                    <label className="flex items-start gap-2 text-sm text-charcoal">
                      <input
                        type="checkbox"
                        checked={collectionIds.includes(collection.id)}
                        onChange={() => setCollectionIds(toggleId(collectionIds, collection.id))}
                      />
                      <span>
                        {collection.name}
                        <span className="ml-1 text-xs text-stone">({collection.collectionType})</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <FieldLabel optional>Tags</FieldLabel>
            {tags.length === 0 ? (
              <p className="mt-2 text-sm text-stone">No tags yet. Add tags under Admin → Taxonomy.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <label className="flex items-start gap-2 text-sm text-charcoal">
                      <input
                        type="checkbox"
                        checked={tagIds.includes(tag.id)}
                        onChange={() => setTagIds(toggleId(tagIds, tag.id))}
                      />
                      <span>
                        {tag.name}
                        <span className="ml-1 text-xs text-stone">({tag.tagType})</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Advanced" description="SKU, status, fabric, and print" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel optional={!isEdit} hint={isEdit ? undefined : "Auto-generated if left blank"}>
              SKU
            </FieldLabel>
            <input
              className={inputClass}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder={isEdit ? undefined : "Auto-generated from name"}
              readOnly={isEdit && Boolean(product?.sku)}
            />
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
            >
              <option value="DRAFT">Draft — not on shop</option>
              <option value="ACTIVE">Active — visible on shop</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {status === "ACTIVE" && (
              <p className="mt-1 text-xs text-stone">
                Publishing requires a product type and price.
              </p>
            )}
          </div>
          <div>
            <FieldLabel optional>Fabric</FieldLabel>
            <select className={inputClass} value={fabricId} onChange={(e) => setFabricId(e.target.value)}>
              <option value="">— None —</option>
              {fabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel optional>Print</FieldLabel>
            <select className={inputClass} value={printId} onChange={(e) => setPrintId(e.target.value)}>
              <option value="">— None —</option>
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
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving
            ? "Saving…"
            : status === "ACTIVE" && !isEdit
              ? "Publish product"
              : isEdit
                ? "Update product"
                : "Save draft"}
        </Button>
        {!isEdit && status === "ACTIVE" && (
          <Button
            type="button"
            variant="outline"
            disabled={saving || !name.trim()}
            onClick={() => void saveDraft()}
          >
            Save as draft instead
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.admin.products)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
