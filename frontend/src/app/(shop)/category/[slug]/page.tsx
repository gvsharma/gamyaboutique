import Link from "next/link";
import { CategoryPageClient } from "@/components/shop/category-page-client";
import { CoverHeroImage } from "@/components/ui/cover-hero-image";
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
    const match =
      categories.find((c) => c.slug === catalogSlug) ??
      (catalogSlug === "girls" ? categories.find((c) => c.slug === "kids") : undefined);
    if (match) {
      categoryName = slug === catalogSlug ? match.name : displayCategoryName(slug);
      coverImage = categoryCoverImage(slug, match.imageUrl);
    }
  } catch {
    // fallback to slug
  }

  return (
    <>
      <div className="relative bg-linen">
        <CoverHeroImage src={coverImage} alt={categoryName} priority variant="banner" />
        <div className="pointer-events-none absolute inset-0 bg-charcoal/25" />
        <div className="container-premium pointer-events-none absolute inset-x-0 bottom-0 flex items-end pb-10 pt-16">
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
