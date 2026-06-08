import { ProductCard } from "@/components/catalog/product-card";
import type { ProductSummary } from "@/types/product";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-stone">
        No pieces match your search. Try another category or term.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
