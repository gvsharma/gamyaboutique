"use client";

import type { PromoVideo } from "@/types/promo-video";

interface PromoVideoFeaturedProps {
  video: PromoVideo;
}

export function PromoVideoFeatured({ video }: PromoVideoFeaturedProps) {
  return (
    <section className="bg-charcoal section-luxury">
      <div className="container-premium grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-video overflow-hidden bg-charcoal ring-1 ring-pearl/10">
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
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/55">
            Inside the boutique
          </p>
          <h2 className="mt-4 font-display text-section-title text-pearl">{video.title}</h2>
          {video.description && (
            <p className="mt-5 max-w-md text-base leading-relaxed text-pearl/70">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
