import Image from "next/image";
import Link from "next/link";
import { HeroBanner } from "@/components/home/hero-banner";
import { PromoVideoShowcase } from "@/components/home/promo-video-showcase";
import { categoryCoverImage } from "@/lib/category-images";
import { filterWomenGirlsProducts, pickHomepageCategories } from "@/lib/catalog-filters";
import { EditorialFeatures } from "@/components/home/editorial-features";
import { ProductCarousel } from "@/components/home/product-carousel";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { whatsappHref } from "@/constants/site";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { PageResponse } from "@/types/api";
import type { CategoryTreeNode } from "@/types/catalog";
import type { ProductSummary } from "@/types/product";
import type { PromoVideo } from "@/types/promo-video";

export default async function HomePage() {
  let categories: CategoryTreeNode[] = [];
  let featured: ProductSummary[] = [];
  let trending: ProductSummary[] = [];
  let promoVideos: PromoVideo[] = [];

  try {
    const [categoriesResult, featuredResult, trendingResult, promoResult] = await Promise.allSettled([
      serverFetch<CategoryTreeNode[]>(API.categoriesTree),
      serverFetch<PageResponse<ProductSummary>>("/products?page=0&size=8").then((p) => p.content),
      serverFetch<PageResponse<ProductSummary>>("/products?page=0&size=12").then((p) => p.content),
      serverFetch<PromoVideo[]>(API.promoVideos),
    ]);
    if (categoriesResult.status === "fulfilled") categories = categoriesResult.value;
    if (featuredResult.status === "fulfilled") featured = featuredResult.value;
    if (trendingResult.status === "fulfilled") trending = trendingResult.value;
    if (promoResult.status === "fulfilled") promoVideos = promoResult.value;
  } catch {
    // API offline — page still renders
  }

  const spotlightCategories = pickHomepageCategories(categories);
  const womenTrending = filterWomenGirlsProducts(trending);
  const womenFeatured = filterWomenGirlsProducts(featured);

  return (
    <>
      <HeroBanner />

      {promoVideos.length > 0 && <PromoVideoShowcase videos={promoVideos} />}

      {spotlightCategories.length > 0 && (
        <section className="container-premium py-20 sm:py-24">
          <SectionHeader
            eyebrow="Collections"
            title="Discover our bestsellers this month"
            description="Handpicked sarees, lehengas, and girls wear — styled for celebrations and everyday elegance."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {spotlightCategories.map((cat) => (
              <Link
                key={cat.id}
                href={ROUTES.category(cat.slug)}
                className="group relative aspect-[3/4] overflow-hidden bg-linen"
              >
                <Image
                  src={categoryCoverImage(cat.slug, cat.imageUrl)}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-pearl/70">
                    Shop
                  </p>
                  <h3 className="mt-1 font-display text-xl text-pearl">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {womenTrending.length > 0 && (
        <ProductCarousel
          products={womenTrending}
          eyebrow="Trending"
          title="Most loved right now"
          description="Pieces our customers are saving and inquiring about this season."
          className="bg-cream"
        />
      )}

      <EditorialFeatures />

      {womenFeatured.length > 0 && (
        <section className="container-premium py-16 sm:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader align="left" eyebrow="Curated" title="Featured pieces" className="mb-0" />
            <Link href={ROUTES.shop} className="hidden shrink-0 sm:block">
              <Button variant="outline" className="rounded-none uppercase tracking-[0.12em]">
                View all
              </Button>
            </Link>
          </div>
          <div className="mt-12">
            <ProductGrid products={womenFeatured} />
          </div>
        </section>
      )}

      <section className="editorial-panel">
        <div className="container-premium grid items-center gap-8 py-20 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/55">
              Personal styling
            </p>
            <h2 className="mt-4 font-display text-section-title text-pearl">
              Bespoke consultations by appointment
            </h2>
            <p className="mt-4 max-w-md text-body text-pearl/70">
              From bridal trousseaus to festive sarees — our Hyderabad team guides you through
              fabric, drape, and embellishment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href={ROUTES.contact} className="btn-editorial-primary">
              Book appointment
            </Link>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-editorial-outline"
            >
              WhatsApp enquiry
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
