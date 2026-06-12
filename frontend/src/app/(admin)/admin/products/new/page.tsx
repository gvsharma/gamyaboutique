import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Catalog</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">New product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
