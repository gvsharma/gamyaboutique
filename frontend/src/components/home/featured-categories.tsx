import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { CategoryTreeNode } from "@/types/catalog";

const CATEGORY_IMAGES: Record<string, string> = {
  sarees: "https://images.unsplash.com/photo-1610030469983-98e550b19538?w=800&q=80",
  lehengas: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  bridal: "https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=800&q=80",
  blouses: "https://images.unsplash.com/photo-1572804013309-59a23b2e4c1f?w=800&q=80",
};

const STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4"] as const;

interface FeaturedCategoriesProps {
  categories: CategoryTreeNode[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const topLevel = categories.slice(0, 4);

  return (
    <section className="container-premium py-20 sm:py-28">
      <SectionHeader
        eyebrow="Collections"
        title="Shop by category"
        description="From everyday elegance to bridal grandeur — discover pieces styled for Indian women."
      />
      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {topLevel.map((cat, index) => (
          <Link
            key={cat.id}
            href={ROUTES.category(cat.slug)}
            className={cn(
              "group relative aspect-[3/4] overflow-hidden bg-linen animate-fade-up",
              STAGGER[Math.min(index, 3)],
            )}
          >
            <Image
              src={CATEGORY_IMAGES[cat.slug] ?? CATEGORY_IMAGES.sarees}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/5 to-transparent transition-opacity duration-500 group-hover:from-charcoal/65" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-pearl/60">
                Collection
              </p>
              <h3 className="mt-1 font-display text-xl text-pearl sm:text-2xl">{cat.name}</h3>
              {cat.description && (
                <p className="mt-2 line-clamp-2 text-sm text-pearl/70 opacity-0 transition-all duration-400 group-hover:opacity-100">
                  {cat.description}
                </p>
              )}
              <span className="mt-3 inline-block text-[11px] font-medium uppercase tracking-wider text-pearl/80 opacity-0 transition-all duration-400 group-hover:opacity-100">
                Shop now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
