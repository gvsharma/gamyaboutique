import { CollectionPageClient } from "@/components/shop/collection-page-client";
import { CoverHeroImage } from "@/components/ui/cover-hero-image";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import { categoryCoverImage } from "@/lib/category-images";
import type { CollectionDto } from "@/types/catalog";

interface Props {
  params: Promise<{ slug: string }>;
}

function typeEyebrow(type: CollectionDto["collectionType"]): string {
  switch (type) {
    case "EVENT":
      return "Event collection";
    case "TREND":
      return "Trend edit";
    case "SEASON":
      return "Seasonal collection";
    case "FEATURED":
      return "Featured";
    default:
      return "Collection";
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const collection = await serverFetch<CollectionDto>(API.collection(slug));
    return { title: collection.name, description: collection.description ?? undefined };
  } catch {
    return { title: slug.replace(/-/g, " ") };
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  let collection: CollectionDto | null = null;

  try {
    collection = await serverFetch<CollectionDto>(API.collection(slug));
  } catch {
    collection = null;
  }

  const title = collection?.name ?? slug.replace(/-/g, " ");
  const coverImage = collection?.imageUrl
    ? collection.imageUrl
    : categoryCoverImage(slug);
  const eyebrow = collection ? typeEyebrow(collection.collectionType) : "Collection";

  return (
    <>
      <div className="relative bg-linen">
        <CoverHeroImage src={coverImage} alt={title} priority variant="banner" />
        <div className="pointer-events-none absolute inset-0 bg-charcoal/25" />
        <div className="container-premium pointer-events-none absolute inset-x-0 bottom-0 flex items-end pb-10 pt-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/70">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-section-title text-pearl">{title}</h1>
            {collection?.description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pearl/80">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="container-premium py-12 sm:py-16 lg:py-20">
        <CollectionPageClient slug={slug} />
      </div>
    </>
  );
}
