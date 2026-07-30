import { apiClient } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";
import type { CrmLead } from "@/types/admin";

export interface CreateConsultationPayload {
  name: string;
  email?: string;
  phone: string;
  occasion?: string;
  budgetBand?: string;
  timeline?: string;
  serviceType?: string;
  message?: string;
  productId?: string;
}

export async function submitConsultation(
  payload: CreateConsultationPayload,
): Promise<CrmLead> {
  const { data } = await apiClient.post<ApiResponse<CrmLead>>(API.consultations, payload);
  return data.data;
}
