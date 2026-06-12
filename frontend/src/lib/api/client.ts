import axios from "axios";
import { guestCartStorage } from "@/lib/auth/guest-cart-storage";
import { tokenStorage } from "@/lib/auth/token-storage";
import { resolveBrowserApiBaseUrl } from "@/lib/api/config";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const baseURL = resolveBrowserApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const guestCartId = guestCartStorage.get();
  if (guestCartId && config.url?.includes("/cart")) {
    config.headers["X-Guest-Cart-Id"] = guestCartId;
  }
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const hadAuth = Boolean(error.config?.headers?.Authorization);
      if (hadAuth) {
        useAuthStore.getState().logout();
        useWishlistStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);

export function getApiBaseUrl(): string {
  return baseURL;
}
