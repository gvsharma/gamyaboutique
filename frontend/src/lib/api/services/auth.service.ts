import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import { guestCartStorage } from "@/lib/auth/guest-cart-storage";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { ApiResponse } from "@/types/api";
import type {
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  UserProfile,
} from "@/types/auth";

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(API.authLogin, payload);
  tokenStorage.set(data.data.accessToken, data.data.refreshToken);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(API.authRegister, payload);
  tokenStorage.set(data.data.accessToken, data.data.refreshToken);
  return data.data;
}

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(API.authMe);
  return data.data;
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefresh();
  try {
    await apiClient.post(API.authLogout, { refreshToken });
  } finally {
    tokenStorage.clear();
  }
}

export async function forgotPassword(identifier: string): Promise<void> {
  await apiClient.post(API.authForgotPassword, { identifier });
}

export async function resetPassword(payload: {
  token?: string;
  otp?: string;
  identifier?: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post(API.authResetPassword, payload);
}

export async function mergeGuestCart(): Promise<void> {
  const guestId = guestCartStorage.get();
  if (!guestId) return;
  await apiClient.post(API.cartMerge, null, {
    headers: { "X-Guest-Cart-Id": guestId },
  });
  guestCartStorage.clear();
}

export async function completeAuthSession(): Promise<UserProfile> {
  const user = await fetchMe();
  try {
    await mergeGuestCart();
  } catch {
    // cart merge is best-effort
  }
  return user;
}
