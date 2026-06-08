import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { TokenResponse, UserProfile } from "@/types/auth";

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(API.authLogin, {
    email,
    password,
  });
  return data.data;
}

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>(API.authMe);
  return data.data;
}
