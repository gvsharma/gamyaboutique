import Image from "next/image";
import Link from "next/link";
import { CategoryPageClient } from "@/components/shop/category-page-client";
import { SectionHeader } from "@/components/ui/section-header";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import { categoryCoverImage } from "@/lib/category-images";
import { displayCategoryName, resolveCatalogSlug } from "@/lib/category-slugs";
import type { CategoryDto } from "@/types/catalog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const catalogSlug = resolveCatalogSlug(slug);
  let categoryName = displayCategoryName(slug);
  let coverImage = categoryCoverImage(slug);

  try {
    const categories = await serverFetch<CategoryDto[]>(API.catalogCategories);
    const match = categories.find((c) => c.slug === catalogSlug);
    if (match) {
      categoryName = slug === catalogSlug ? match.name : displayCategoryName(slug);
      coverImage = categoryCoverImage(slug, match.imageUrl);
    }
  } catch {
    // fallback to slug
  }

  return (
    <>
      <div className="relative aspect-[21/9] min-h-[12rem] overflow-hidden bg-linen sm:min-h-[16rem]">
        <Image
          src={coverImage}
          alt={categoryName}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/35" />
        <div className="container-premium relative flex h-full items-end pb-10 pt-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/70">
              Collection
            </p>
            <h1 className="mt-2 font-display text-section-title capitalize text-pearl">
              {categoryName}
            </h1>
          </div>
        </div>
      </div>
      <div className="container-premium py-12 sm:py-16 lg:py-20">
        <CategoryPageClient slug={slug} />
      </div>
    </>
  );
}
