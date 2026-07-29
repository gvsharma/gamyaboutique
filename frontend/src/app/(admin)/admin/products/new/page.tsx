import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { QuickProductForm } from "@/components/admin/quick-product-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const fullMode = mode === "full";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-eyebrow">Catalog</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">
            {fullMode ? "New product (full form)" : "Quick add product"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            {fullMode
              ? "All catalog fields — SKU, inventory, sizes, fabric, and media."
              : "Name, type, description, and price only. Add photos and video after saving."}
          </p>
        </div>
        <div className="flex gap-2">
          {fullMode ? (
            <Link href={ROUTES.admin.productNew}>
              <Button variant="outline">Quick add</Button>
            </Link>
          ) : (
            <Link href={`${ROUTES.admin.productNew}?mode=full`}>
              <Button variant="outline">Full form</Button>
            </Link>
          )}
          <Link href={ROUTES.admin.productImport}>
            <Button variant="outline">Import CSV / Excel</Button>
          </Link>
        </div>
      </div>
      {fullMode ? <ProductForm /> : <QuickProductForm />}
    </div>
  );
}
