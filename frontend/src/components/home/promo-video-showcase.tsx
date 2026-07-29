"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import type { PromoVideo } from "@/types/promo-video";
import { cn } from "@/lib/utils";

interface PromoVideoShowcaseProps {
  videos: PromoVideo[];
  className?: string;
}

export function PromoVideoShowcase({ videos, className }: PromoVideoShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (videos.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className={cn("bg-charcoal py-16 sm:py-24", className)}>
      <div className="container-premium">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            align="left"
            eyebrow="Gamya Couture"
            title="Inside the boutique"
            description="Stories, craftsmanship, and celebrations — watch our latest promos."
            className="[&_h2]:text-pearl [&_p]:text-pearl/70 [&_.text-eyebrow]:text-pearl/55"
          />
          {videos.length > 1 && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="rounded-full border border-pearl/20 p-2.5 text-pearl/70 transition-colors hover:border-pearl/40 hover:text-pearl"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="rounded-full border border-pearl/20 p-2.5 text-pearl/70 transition-colors hover:border-pearl/40 hover:text-pearl"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scrollbar-none sm:gap-6"
        >
          {videos.map((video) => (
            <article
              key={video.id}
              className="w-[min(88vw,22rem)] shrink-0 snap-start sm:w-[min(42vw,24rem)] lg:w-[min(32vw,28rem)]"
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-sm bg-charcoal ring-1 ring-pearl/10 sm:aspect-video">
                <video
                  src={video.videoUrl}
                  poster={video.posterUrl ?? undefined}
                  controls
                  playsInline
                  muted
                  loop
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-display text-lg text-pearl">{video.title}</h3>
                {video.description && (
                  <p className="mt-1 text-sm leading-relaxed text-pearl/65">{video.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
