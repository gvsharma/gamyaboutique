"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { FileDropZone } from "@/components/admin/file-drop-zone";
import { CatalogImage } from "@/components/ui/catalog-image";
import { categoryCoverImage } from "@/lib/category-images";
import type { MediaUploadResponse } from "@/types/admin";

interface CoverImageUploaderProps {
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  upload: (file: File) => Promise<MediaUploadResponse>;
  slug?: string;
  alt?: string;
}

export function CoverImageUploader({
  imageUrl,
  onChange,
  upload,
  slug,
  alt = "Category cover",
}: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = imageUrl?.trim()
    ? imageUrl
    : slug
      ? categoryCoverImage(slug)
      : null;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await upload(file);
      onChange(result.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed.";
      setError(message.includes("S3") ? message : `${message} Check S3 config on the backend.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FileDropZone
      accept="image/jpeg,image/png,image/webp,image/gif"
      disabled={uploading}
      uploading={uploading}
      uploadLabel="Uploading…"
      idleLabel="Drop cover image from your Mac, or click to browse"
      hint="JPEG, PNG, WebP, GIF · optional"
      onFiles={(files) => void handleFile(files[0])}
    >
      {previewSrc && (
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-charcoal/10 bg-pearl sm:h-32 sm:w-32">
            <CatalogImage
              src={previewSrc}
              fallbackSrc={slug ? categoryCoverImage(slug) : "/brand/hero-saree.jpg"}
              alt={alt}
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
            {imageUrl && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute right-1.5 top-1.5 rounded-full bg-charcoal/75 p-1 text-cream"
                aria-label="Remove cover image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {!imageUrl && slug && (
            <p className="text-xs text-stone self-center">
              Showing brand default until you upload a custom cover.
            </p>
          )}
        </div>
      )}
      {error && <p className="text-xs text-maroon">{error}</p>}
    </FileDropZone>
  );
}
