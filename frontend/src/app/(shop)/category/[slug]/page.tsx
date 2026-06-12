import { CategoryPageClient } from "@/components/shop/category-page-client";
import { SectionHeader } from "@/components/ui/section-header";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
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
  let categoryName = slug.replace(/-/g, " ");

  try {
    const categories = await serverFetch<CategoryDto[]>(API.catalogCategories);
    const match = categories.find((c) => c.slug === slug);
    if (match) categoryName = match.name;
  } catch {
    // fallback to slug
  }

  return (
    <div className="container-premium py-12 sm:py-16 lg:py-20">
      <SectionHeader
        align="left"
        eyebrow="Collection"
        title={categoryName}
        className="mb-10 capitalize"
      />
      <CategoryPageClient slug={slug} />
    </div>
  );
}
