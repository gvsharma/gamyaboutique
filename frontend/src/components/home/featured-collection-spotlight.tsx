import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { categoryCoverImage } from "@/lib/category-images";
import type { CollectionDto } from "@/types/catalog";

interface FeaturedCollectionSpotlightProps {
  collection: CollectionDto;
  subtitle?: string | null;
}

export function FeaturedCollectionSpotlight({
  collection,
  subtitle,
}: FeaturedCollectionSpotlightProps) {
  const image = collection.imageUrl ?? categoryCoverImage(collection.slug);

  return (
    <section className="section-luxury">
      <div className="container-premium">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Link
            href={ROUTES.collection(collection.slug)}
            className="group relative aspect-[4/5] overflow-hidden bg-linen lg:col-span-7"
          >
            <Image
              src={image}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/35 via-transparent to-transparent" />
          </Link>
          <div className="lg:col-span-5">
            <p className="text-eyebrow">Curated edit</p>
            <h2 className="mt-4 font-display text-section-title text-charcoal text-balance">
              {collection.name}
            </h2>
            {(collection.description || subtitle) && (
              <p className="mt-5 max-w-md text-body">
                {collection.description ?? subtitle}
              </p>
            )}
            <Link
              href={ROUTES.collection(collection.slug)}
              className="mt-10 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon transition-colors hover:text-maroon-hover"
            >
              Explore the collection →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
