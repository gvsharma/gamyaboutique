"use client";

import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { useState } from "react";
import { CatalogImage } from "@/components/ui/catalog-image";
import { uploadProductImage } from "@/lib/api/services/admin.service";
import {
  normalizeProductImage,
  productPlaceholderImage,
} from "@/lib/category-images";
import type { ProductImageInput } from "@/types/admin";

interface ImageUploaderProps {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  productName?: string;
}

function reorderImages(images: ProductImageInput[]): ProductImageInput[] {
  return images.map((img, index) => ({ ...img, displayOrder: index }));
}

export function ImageUploader({ images, onChange, productName }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: ProductImageInput[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadProductImage(file);
        uploaded.push({
          url: result.url,
          altText: productName ?? file.name,
          displayOrder: images.length + uploaded.length,
        });
      }
      onChange(reorderImages([...images, ...uploaded]));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed.";
      setError(message.includes("S3") ? message : `${message} Check S3 config on the backend.`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(reorderImages(images.filter((_, i) => i !== index)));
  };

  const moveImage = (index: number, delta: number) => {
    const next = index + delta;
    if (next < 0 || next >= images.length) return;
    const updated = [...images];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    onChange(reorderImages(updated));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="relative h-24 w-24 overflow-hidden rounded-xl border border-charcoal/10 bg-pearl"
          >
            <CatalogImage
              src={normalizeProductImage(image.url, null, productName ?? image.altText)}
              fallbackSrc={productPlaceholderImage(null, productName ?? image.altText)}
              alt={image.altText ?? "Product"}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
            <div className="absolute left-1 top-1 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => moveImage(index, -1)}
                disabled={index === 0}
                className="rounded bg-charcoal/70 p-0.5 text-cream disabled:opacity-30"
                aria-label="Move earlier"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, 1)}
                disabled={index === images.length - 1}
                className="rounded bg-charcoal/70 p-0.5 text-cream disabled:opacity-30"
                aria-label="Move later"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded-full bg-charcoal/70 p-0.5 text-cream"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-charcoal/15 px-4 py-3 text-sm text-maroon transition-colors hover:border-maroon/30 hover:bg-ivory/60">
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading to S3…" : "Upload images"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="text-xs text-maroon">{error}</p>}
      <p className="text-xs text-stone">
        First image is the primary. Use arrows to reorder. Uploads go to S3 via CloudFront.
      </p>
    </div>
  );
}
