import { ProductCard } from "@/components/catalog/product-card";
import type { ProductSummary } from "@/types/product";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="font-display text-xl text-charcoal">No pieces found</p>
        <p className="mt-2 max-w-sm text-body">Try another search or explore our collections.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
