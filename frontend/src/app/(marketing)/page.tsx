import { HeroBanner } from "@/components/home/hero-banner";
import { PromoVideoFeatured } from "@/components/home/promo-video-featured";
import { FeaturedCollectionSpotlight } from "@/components/home/featured-collection-spotlight";
import { CategoryDoors } from "@/components/home/category-doors";
import { ProductCarousel } from "@/components/home/product-carousel";
import { BoutiqueStory } from "@/components/home/boutique-story";
import { BoutiqueConsultationCta } from "@/components/home/boutique-consultation-cta";
import { pickHomepageCategories } from "@/lib/catalog-filters";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { CategoryTreeNode } from "@/types/catalog";
import type { HomepageDto } from "@/types/homepage";
import type { PromoVideo } from "@/types/promo-video";

export default async function HomePage() {
  let categories: CategoryTreeNode[] = [];
  let homepage: HomepageDto | null = null;
  let promoVideos: PromoVideo[] = [];

  try {
    const [categoriesResult, homepageResult, promoResult] = await Promise.allSettled([
      serverFetch<CategoryTreeNode[]>(API.categoriesTree),
      serverFetch<HomepageDto>(API.siteHomepage),
      serverFetch<PromoVideo[]>(API.promoVideos),
    ]);
    if (categoriesResult.status === "fulfilled") categories = categoriesResult.value;
    if (homepageResult.status === "fulfilled") homepage = homepageResult.value;
    if (promoResult.status === "fulfilled") promoVideos = promoResult.value;
  } catch {
    // API offline — page still renders
  }

  const spotlightCategories = pickHomepageCategories(categories).slice(0, 3);
  const featuredVideo = promoVideos[0] ?? null;
  const featuredCollection = homepage?.featuredCollection ?? null;
  const curatedProducts = homepage?.curatedProducts ?? [];
  const curatedEyebrow = homepage?.curatedEditSlot?.title ?? "Editor's pick";
  const curatedTitle = homepage?.curatedEditSlot?.subtitle ?? "Pieces we love this season";

  return (
    <>
      <HeroBanner />

      {featuredVideo && <PromoVideoFeatured video={featuredVideo} />}

      {featuredCollection && (
        <FeaturedCollectionSpotlight
          collection={featuredCollection}
          subtitle={homepage?.featuredCollectionSlot?.subtitle}
        />
      )}

      {spotlightCategories.length > 0 && <CategoryDoors categories={spotlightCategories} />}

      {curatedProducts.length > 0 && (
        <ProductCarousel
          products={curatedProducts}
          eyebrow={curatedEyebrow}
          title={curatedTitle}
          className="bg-cream"
        />
      )}

      <BoutiqueStory />

      <BoutiqueConsultationCta />
    </>
  );
}
