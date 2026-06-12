import Image from "next/image";
import Link from "next/link";
import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryPills } from "@/components/home/category-pills";
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

      {/* Category pills strip */}
      {categories.length > 0 && (
        <section className="border-b border-charcoal/5 bg-pearl py-6">
          <div className="container-premium">
            <CategoryPills categories={categories} />
          </div>
        </section>
      )}

      {categories.length > 0 && <FeaturedCategories categories={categories} />}

      {/* Promotional split banner */}
      <section className="overflow-hidden bg-ivory">
        <div className="container-premium">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-0">
            <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[28rem]">
              <Image
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80"
                alt="Bridal lehenga collection"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center px-0 py-12 lg:px-16 lg:py-20">
              <p className="text-eyebrow">Limited edition</p>
              <h2 className="mt-4 font-display text-section-title text-charcoal">
                Bridal season essentials
              </h2>
              <p className="mt-4 max-w-md text-body">
                Hand-embroidered lehengas and heirloom sarees — curated for the bride who values
                craftsmanship and timeless elegance.
              </p>
              <Link href={ROUTES.category("bridal")} className="mt-8 w-fit">
                <Button variant="primary" size="lg">
                  Shop bridal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {trending.length > 0 && (
        <ProductCarousel
          products={trending}
          eyebrow="Trending"
          title="Most loved right now"
          description="Pieces our customers are saving and inquiring about this season."
        />
      )}

      <section className="container-premium py-16 sm:py-24">
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

      {/* CTA promo strip */}
      <section className="promo-strip">
        <div className="container-premium grid items-center gap-8 py-20 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-eyebrow text-pearl/60">Personal styling</p>
            <h2 className="mt-4 font-display text-section-title text-pearl">
              Bespoke consultations by appointment
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-body text-pearl/70 lg:ml-auto lg:max-w-md">
              From bridal trousseaus to festive sarees — our team guides you through fabric, drape,
              and embellishment.
            </p>
            <Link href={ROUTES.contact} className="mt-8 inline-block lg:mt-6">
              <Button
                variant="outline"
                size="lg"
                className="border-pearl/30 text-pearl hover:border-pearl hover:bg-pearl/10"
              >
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
