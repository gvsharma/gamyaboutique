"use client";

import { ImagePlus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
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

  const handleFiles = async (files: FileList | null) => {
    await handleFile(files?.[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    await handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-4">
        {previewSrc && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-charcoal/10 bg-pearl">
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
        )}

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex min-h-32 min-w-[12rem] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors ${
            dragging
              ? "border-maroon bg-maroon/5 text-maroon"
              : "border-charcoal/15 text-stone hover:border-maroon/30 hover:bg-ivory/60"
          }`}
        >
          {uploading ? (
            <>
              <Upload className="h-5 w-5 animate-pulse" />
              <span>Uploading to S3…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span>{previewSrc && !imageUrl ? "Upload custom cover" : "Drop image or click to upload"}</span>
              <span className="text-xs text-stone/80">JPEG, PNG, WebP, GIF</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error && <p className="text-xs text-maroon">{error}</p>}
      {!imageUrl && slug && (
        <p className="text-xs text-stone">Using brand default until you upload a custom cover.</p>
      )}
    </div>
  );

}
