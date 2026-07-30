import { CollectionsIndexGrid } from "@/components/shop/collections-index-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { CollectionDto } from "@/types/catalog";

export const metadata = {
  title: "Collections",
  description: "Curated edits, seasonal collections, and trend stories from Gamya Couture.",
};

export default async function CollectionsIndexPage() {
  let collections: CollectionDto[] = [];

  try {
    collections = await serverFetch<CollectionDto[]>(API.collections);
  } catch {
    collections = [];
  }

  return (
    <div className="section-luxury">
      <div className="container-premium">
        <SectionHeader
          eyebrow="Curated edits"
          title="Collections"
          description="Event dressing, seasonal edits, and trend stories — styled for celebrations and everyday elegance."
        />
        <div className="mt-14">
          <CollectionsIndexGrid collections={collections} />
        </div>
      </div>
    </div>
  );
}
