import axios from "axios";
import { guestCartStorage } from "@/lib/auth/guest-cart-storage";
import { tokenStorage } from "@/lib/auth/token-storage";
import { resolveBrowserApiBaseUrl } from "@/lib/api/config";

const baseURL = resolveBrowserApiBaseUrl();

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const guestCartId = guestCartStorage.get();
    if (guestCartId && config.url?.includes("/cart")) {
      config.headers["X-Guest-Cart-Id"] = guestCartId;
    }
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
      const path = window.location.pathname;
      const isAuthPage =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password");
      if (!isAuthPage) {
        tokenStorage.clear();
        window.location.href = `/login?returnUrl=${encodeURIComponent(path)}`;
      }
    }
    return Promise.reject(error);
  },
);

export function getApiBaseUrl(): string {
  return baseURL;
}
