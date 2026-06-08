import Link from "next/link";
import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { PageResponse } from "@/types/api";
import type { CategoryTreeNode } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";

export default async function HomePage() {
  let categories: CategoryTreeNode[] = [];
  let featured: ProductSummary[] = [];

  try {
    [categories, featured] = await Promise.all([
      serverFetch<CategoryTreeNode[]>(API.categoriesTree),
      serverFetch<PageResponse<ProductSummary>>("/products?page=0&size=8").then(
        (p) => p.content,
      ),
    ]);
  } catch {
    // API offline — page still renders
  }

  return (
    <>
      <HeroBanner />
      {categories.length > 0 && <FeaturedCategories categories={categories} />}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Curated</p>
            <h2 className="mt-2 font-display text-3xl text-burgundy sm:text-4xl">
              Featured pieces
            </h2>
          </div>
          <Link href={ROUTES.shop} className="hidden sm:block">
            <Button variant="outline">View all</Button>
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid products={featured} />
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Link href={ROUTES.shop}>
            <Button variant="outline">View all</Button>
          </Link>
        </div>
      </section>
      <section className="bg-burgundy px-4 py-16 text-center text-cream sm:px-6">
        <p className="font-display text-2xl sm:text-3xl">Bespoke consultations by appointment</p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-cream/80">
          From bridal trousseaus to festive sarees — our team guides you through fabric, drape, and
          embellishment.
        </p>
        <Link href={ROUTES.contact} className="mt-8 inline-block">
          <Button variant="secondary">Get in touch</Button>
        </Link>
      </section>
    </>
  );
}
