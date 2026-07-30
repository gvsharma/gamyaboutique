import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-eyebrow">Catalog</p>
          <h1 className="mt-2 font-display text-section-title text-charcoal">New product</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Add a name and save a draft. Drag photos from your Mac anytime — nothing else is
            required until you publish.
          </p>
        </div>
        <Link href={ROUTES.admin.productImport}>
          <Button variant="outline">Import CSV</Button>
        </Link>
      </div>
      <ProductForm />
    </div>
  );
}
