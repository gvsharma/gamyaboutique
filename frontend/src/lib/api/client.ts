import axios from "axios";
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
  }
  return config;
});

export function getApiBaseUrl(): string {
  return baseURL;
}
