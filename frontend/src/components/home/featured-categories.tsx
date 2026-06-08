import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { CategoryTreeNode } from "@/types/catalog";

interface FeaturedCategoriesProps {
  categories: CategoryTreeNode[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const topLevel = categories.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Browse</p>
        <h2 className="mt-2 font-display text-3xl text-burgundy sm:text-4xl">
          Shop by category
        </h2>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topLevel.map((cat) => (
          <Link
            key={cat.id}
            href={ROUTES.category(cat.slug)}
            className="group relative overflow-hidden rounded-sm bg-ivory p-8 transition-colors hover:bg-burgundy/5"
          >
            <p className="text-xs uppercase tracking-widest text-stone group-hover:text-burgundy">
              Collection
            </p>
            <h3 className="mt-2 font-display text-2xl text-charcoal group-hover:text-burgundy">
              {cat.name}
            </h3>
            {cat.description && (
              <p className="mt-2 line-clamp-2 text-sm text-stone">{cat.description}</p>
            )}
            {cat.children.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {cat.children.slice(0, 3).map((child) => (
                  <li
                    key={child.id}
                    className="text-xs text-burgundy/80 underline-offset-2 group-hover:underline"
                  >
                    {child.name}
                  </li>
                ))}
              </ul>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
