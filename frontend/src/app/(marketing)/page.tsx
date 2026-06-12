import Link from "next/link";
import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductCarousel } from "@/components/home/product-carousel";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { PageResponse } from "@/types/api";
import type { CategoryTreeNode } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";

export default async function HomePage() {
  let categories: CategoryTreeNode[] = [];
  let featured: ProductSummary[] = [];
  let trending: ProductSummary[] = [];

  try {
    [categories, featured, trending] = await Promise.all([
      serverFetch<CategoryTreeNode[]>(API.categoriesTree),
      serverFetch<PageResponse<ProductSummary>>("/products?page=0&size=8").then((p) => p.content),
      serverFetch<PageResponse<ProductSummary>>("/products?page=0&size=12").then((p) => p.content),
    ]);
  } catch {
    // API offline — page still renders
  }

  return (
    <>
      <HeroBanner />
      {categories.length > 0 && <FeaturedCategories categories={categories} />}
      {trending.length > 0 && (
        <ProductCarousel
          products={trending}
          eyebrow="Trending"
          title="Most loved right now"
          description="Pieces our customers are saving and inquiring about this season."
        />
      )}
      <section className="container-premium py-16 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader align="left" eyebrow="Curated" title="Featured pieces" className="mb-0" />
          <Link href={ROUTES.shop} className="hidden shrink-0 sm:block">
            <Button variant="outline">View all</Button>
          </Link>
        </div>
        <div className="mt-12">
          <ProductGrid products={featured} />
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Link href={ROUTES.shop}>
            <Button variant="outline">View all</Button>
          </Link>
        </div>
      </section>
      <section className="relative overflow-hidden bg-charcoal px-4 py-20 text-center sm:px-6 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon/30 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-eyebrow text-pearl/70">Personal styling</p>
          <p className="mt-4 font-display text-3xl text-pearl sm:text-4xl">
            Bespoke consultations by appointment
          </p>
          <p className="mx-auto mt-5 max-w-lg text-body text-pearl/75">
            From bridal trousseaus to festive sarees — our team guides you through fabric, drape, and
            embellishment.
          </p>
          <Link href={ROUTES.contact} className="mt-8 inline-block">
            <Button variant="secondary">Get in touch</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
