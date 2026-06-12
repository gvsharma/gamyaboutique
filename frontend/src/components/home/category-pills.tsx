import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { CategoryTreeNode } from "@/types/catalog";

interface CategoryPillsProps {
  categories: CategoryTreeNode[];
  activeSlug?: string;
  className?: string;
}

export function CategoryPills({ categories, activeSlug, className }: CategoryPillsProps) {
  const topLevel = categories.slice(0, 8);
  if (topLevel.length === 0) return null;

  return (
    <div className={cn("scrollbar-hide flex gap-2 overflow-x-auto pb-1", className)}>
      <Link
        href={ROUTES.shop}
        className={cn("category-pill", !activeSlug && "category-pill-active")}
      >
        All
      </Link>
      {topLevel.map((cat) => (
        <Link
          key={cat.id}
          href={ROUTES.category(cat.slug)}
          className={cn("category-pill", activeSlug === cat.slug && "category-pill-active")}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
