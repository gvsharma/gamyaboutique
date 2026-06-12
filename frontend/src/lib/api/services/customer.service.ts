import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { Address, CustomerProfile } from "@/types/customer";

export async function fetchCustomerProfile(): Promise<CustomerProfile> {
  const { data } = await apiClient.get<ApiResponse<CustomerProfile>>(API.customerMe);
  return data.data;
}

export async function updateCustomerProfile(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}): Promise<CustomerProfile> {
  const { data } = await apiClient.put<ApiResponse<CustomerProfile>>(API.customerMe, payload);
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.put(API.customerPassword, { currentPassword, newPassword });
}

export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<ApiResponse<Address[]>>(API.customerAddresses);
  return data.data;
}

export async function addAddress(payload: {
  addressType?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}): Promise<Address> {
  const { data } = await apiClient.post<ApiResponse<Address>>(API.customerAddresses, payload);
  return data.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(API.customerAddress(id));
}
