import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import { categoryCoverImage } from "@/lib/category-images";
import type { CategoryTreeNode } from "@/types/catalog";

interface CategoryDoorsProps {
  categories: CategoryTreeNode[];
}

export function CategoryDoors({ categories }: CategoryDoorsProps) {
  if (categories.length === 0) return null;

  return (
    <section className="section-luxury bg-pearl">
      <div className="container-premium">
        <div className="max-w-xl">
          <p className="text-eyebrow">Shop by category</p>
          <h2 className="mt-3 font-display text-section-title text-charcoal">
            Three doors into the boutique
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={ROUTES.category(cat.slug)}
              className="group relative aspect-[3/4] overflow-hidden bg-linen"
            >
              <Image
                src={categoryCoverImage(cat.slug, cat.imageUrl)}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-pearl/65">
                  Explore
                </p>
                <h3 className="mt-1 font-display text-2xl text-pearl">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
