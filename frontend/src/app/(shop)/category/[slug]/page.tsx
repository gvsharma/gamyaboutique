import { CategoryPageClient } from "@/components/shop/category-page-client";
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
  let categoryName = slug;

  try {
    const categories = await serverFetch<CategoryDto[]>(API.catalogCategories);
    const match = categories.find((c) => c.slug === slug);
    if (match) categoryName = match.name;
  } catch {
    // fallback to slug
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Collection</p>
      <h1 className="mt-2 font-display text-3xl text-burgundy sm:text-4xl">{categoryName}</h1>
      <CategoryPageClient slug={slug} />
    </div>
  );
}
