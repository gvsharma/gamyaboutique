"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductImage } from "@/lib/api/services/admin.service";
import type { ProductImageInput } from "@/types/admin";

interface ImageUploaderProps {
  images: ProductImageInput[];
  onChange: (images: ProductImageInput[]) => void;
  productName?: string;
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
      onChange([...images, ...uploaded]);
    } catch {
      setError("Image upload failed. Check S3 config on the backend.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, displayOrder: i })));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            className="relative h-24 w-24 overflow-hidden rounded-sm border border-burgundy/20 bg-white"
          >
            <Image src={image.url} alt={image.altText ?? "Product"} fill className="object-cover" unoptimized />
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

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-burgundy/30 px-4 py-3 text-sm text-burgundy hover:bg-burgundy/5">
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

      {error && <p className="text-xs text-burgundy">{error}</p>}
      <p className="text-xs text-stone">Images upload to S3 (`gamya-couture-dev-media`) and URLs are saved with the product.</p>
    </div>
  );
}
