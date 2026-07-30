"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { FileDropZone } from "@/components/admin/file-drop-zone";
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
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList) => {
    if (!files.length) return;
    const fileList = Array.from(files);
    setUploading(true);
    setError(null);
    setUploadProgress(`Uploading 0 of ${fileList.length}…`);

    try {
      const results = await Promise.allSettled(
        fileList.map((file) => uploadProductImage(file).then((result) => ({ result, file }))),
      );

      const uploaded: ProductImageInput[] = [];
      const failures: string[] = [];

      results.forEach((outcome, index) => {
        if (outcome.status === "fulfilled") {
          const { result, file } = outcome.value;
          uploaded.push({
            url: result.url,
            altText: productName ?? file.name,
            displayOrder: images.length + uploaded.length,
          });
        } else {
          failures.push(fileList[index]?.name ?? "file");
        }
      });

      if (uploaded.length) {
        onChange(reorderImages([...images, ...uploaded]));
      }
      if (failures.length) {
        setError(
          failures.length === fileList.length
            ? "Upload failed. Check S3 configuration."
            : `${failures.length} file(s) failed: ${failures.join(", ")}`,
        );
      }
    } catch {
      setError("Image upload failed. Check S3 configuration.");
    } finally {
      setUploading(false);
      setUploadProgress(null);
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

  const reorderByDrag = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(reorderImages(updated));
  };

  return (
    <FileDropZone
      accept="image/jpeg,image/png,image/webp,image/gif"
      multiple
      disabled={uploading}
      uploading={uploading}
      uploadLabel={uploadProgress ?? "Uploading…"}
      idleLabel="Drop images from your Mac, or click to browse"
      hint="JPEG, PNG, WebP, GIF · optional · add anytime"
      onFiles={(files) => void handleFiles(files)}
    >
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null) reorderByDrag(dragIndex, index);
                setDragIndex(null);
              }}
              className="relative h-28 w-28 cursor-grab overflow-hidden rounded-xl border border-charcoal/10 bg-pearl active:cursor-grabbing sm:h-32 sm:w-32"
            >
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 z-10 rounded bg-maroon/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cream">
                  Cover
                </span>
              )}
              <CatalogImage
                src={normalizeProductImage(image.url, null, productName ?? image.altText)}
                fallbackSrc={productPlaceholderImage(null, productName ?? image.altText)}
                alt={image.altText ?? "Product"}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
              <div className="absolute bottom-1.5 left-1.5 flex gap-0.5">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="rounded bg-charcoal/70 p-0.5 text-cream disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded bg-charcoal/70 p-0.5 text-cream disabled:opacity-30"
                  aria-label="Move later"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1.5 top-1.5 rounded-full bg-charcoal/70 p-0.5 text-cream"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-maroon">{error}</p>}
      {images.length > 0 && (
        <p className="text-xs text-stone">Drag thumbnails to reorder. First image is the shop cover.</p>
      )}
    </FileDropZone>
  );
}
