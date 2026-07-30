import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { categoryCoverImage } from "@/lib/category-images";
import type { CollectionDto } from "@/types/catalog";

interface CollectionsIndexGridProps {
  collections: CollectionDto[];
}

function typeLabel(type: CollectionDto["collectionType"]): string {
  switch (type) {
    case "EVENT":
      return "Event";
    case "TREND":
      return "Trend";
    case "SEASON":
      return "Season";
    case "FEATURED":
      return "Featured";
    default:
      return "Collection";
  }
}

export function CollectionsIndexGrid({ collections }: CollectionsIndexGridProps) {
  if (collections.length === 0) {
    return (
      <p className="text-center text-body">
        New edits are being curated. Browse our{" "}
        <Link href={ROUTES.shop} className="text-maroon hover:underline">full shop</Link>.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={ROUTES.collection(collection.slug)}
          className="group block"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-linen">
            <Image
              src={collection.imageUrl ?? categoryCoverImage(collection.slug)}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-pearl/65">
                {typeLabel(collection.collectionType)}
              </p>
              <h2 className="mt-1 font-display text-2xl text-pearl">{collection.name}</h2>
            </div>
          </div>
          {collection.description && (
            <p className="mt-4 text-sm leading-relaxed text-stone line-clamp-2">
              {collection.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
