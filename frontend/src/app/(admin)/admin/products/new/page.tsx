import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-burgundy">New product</h1>
      <ProductForm />
    </div>
  );
}
