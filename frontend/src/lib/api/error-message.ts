import axios from "axios";
import type { ApiResponse } from "@/types/api";

export function extractApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.errors?.length) {
      return data.errors.map((fieldError) => `${fieldError.field}: ${fieldError.message}`).join("; ");
    }
    if (data?.message) {
      return data.message;
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
