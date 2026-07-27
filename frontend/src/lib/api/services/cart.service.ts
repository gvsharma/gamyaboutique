import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Cart } from "@/types/cart";

export async function fetchCart(): Promise<Cart> {
  const { data } = await apiClient.get<ApiResponse<Cart>>(API.cart);
  return data.data;
}

export async function addToCart(
  productId: string,
  quantity = 1,
  options?: { selectedSize?: string | null; selectedColor?: string | null },
): Promise<Cart> {
  const { data } = await apiClient.post<ApiResponse<Cart>>(API.cartItems, {
    productId,
    quantity,
    selectedSize: options?.selectedSize ?? undefined,
    selectedColor: options?.selectedColor ?? undefined,
  });
  return data.data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await apiClient.patch<ApiResponse<Cart>>(API.cartItem(itemId), { quantity });
  return data.data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await apiClient.delete<ApiResponse<Cart>>(API.cartItem(itemId));
  return data.data;
}

export async function clearCart(): Promise<Cart> {
  const { data } = await apiClient.delete<ApiResponse<Cart>>(API.cart);
  return data.data;
}
