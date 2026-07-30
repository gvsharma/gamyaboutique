import Link from "next/link";
import { CollectionPageClient } from "@/components/shop/collection-page-client";
import { BoutiqueConsultationCta } from "@/components/home/boutique-consultation-cta";
import { CoverHeroImage } from "@/components/ui/cover-hero-image";
import { ROUTES } from "@/constants/routes";
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
      return "Featured edit";
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
  const coverImage = collection?.imageUrl ?? categoryCoverImage(slug);
  const eyebrow = collection ? typeEyebrow(collection.collectionType) : "Collection";

  return (
    <>
      <div className="relative min-h-[min(52vh,28rem)] bg-linen">
        <CoverHeroImage src={coverImage} alt={title} priority variant="banner" />
        <div className="pointer-events-none absolute inset-0 bg-charcoal/30" />
        <div className="container-premium pointer-events-none absolute inset-x-0 bottom-0 flex items-end pb-12 pt-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/70">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-section-title text-pearl text-balance">{title}</h1>
            {collection?.description && (
              <p className="mt-4 text-base leading-relaxed text-pearl/85">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container-premium section-luxury-tight">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/8 pb-6">
          <p className="text-sm text-stone">The edit</p>
          <Link
            href={ROUTES.shopCollections}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-maroon hover:text-maroon-hover"
          >
            All collections →
          </Link>
        </div>
        <CollectionPageClient slug={slug} />
      </div>

      <BoutiqueConsultationCta />
    </>
  );
}
