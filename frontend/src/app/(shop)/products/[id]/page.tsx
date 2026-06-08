import { ProductDetailClient } from "@/components/product/product-detail-client";
import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { ProductDetail } from "@/types/product";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const product = await serverFetch<ProductDetail>(API.product(id));
    return { title: product.name, description: product.description ?? undefined };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  try {
    const product = await serverFetch<ProductDetail>(API.product(id));
    return <ProductDetailClient product={product} />;
  } catch {
    notFound();
  }
}
