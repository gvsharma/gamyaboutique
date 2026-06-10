"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  altText?: string | null;
}

interface ProductImageGalleryProps {
  images: GalleryImage[];
  productName: string;
  placeholder: string;
}

export function ProductImageGallery({ images, productName, placeholder }: ProductImageGalleryProps) {
  const sorted = images.length > 0 ? images : [{ id: "0", url: placeholder, altText: productName }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setActiveIndex((i) => (i + delta + sorted.length) % sorted.length);
    },
    [sorted.length],
  );

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, go]);

  const active = sorted[activeIndex];

  return (
    <>
      <div>
        <button
          type="button"
          className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ivory"
          onClick={() => setFullscreen(true)}
          aria-label="Open fullscreen gallery"
        >
          <Image
            src={active.url}
            alt={active.altText ?? productName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={activeIndex === 0}
          />
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-pearl/90 px-3 py-1.5 text-xs text-stone backdrop-blur">
            <ZoomIn className="h-3.5 w-3.5" /> Tap to zoom
          </span>
        </button>

        {sorted.length > 1 && (
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory"
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStart == null) return;
              const diff = e.changedTouches[0].clientX - touchStart;
              if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
              setTouchStart(null);
            }}
          >
            {sorted.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                    "relative h-20 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 transition-colors duration-300",
                    i === activeIndex ? "border-maroon" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="64px" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-cream"
            onClick={() => setFullscreen(false)}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative flex flex-1 items-center justify-center p-4">
            <Image
              src={active.url}
              alt={active.altText ?? productName}
              fill
              className="object-contain p-8"
              sizes="100vw"
              priority
            />
          </div>
          {sorted.length > 1 && (
            <div className="flex justify-center gap-2 pb-8">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "h-2 w-2 rounded-full",
                    i === activeIndex ? "bg-pearl" : "bg-pearl/40",
                  )}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
