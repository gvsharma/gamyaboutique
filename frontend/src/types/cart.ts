import type { ProductSummary } from "@/types/product";

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedSize: string | null;
  selectedColor: string | null;
  product: ProductSummary | null;
}

export interface Cart {
  id: string | null;
  guestToken: string | null;
  itemCount: number;
  subtotal: number;
  currency: string;
  items: CartItem[];
}
