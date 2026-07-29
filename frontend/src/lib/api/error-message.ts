import axios from "axios";
import type { ApiResponse } from "@/types/api";

/** Surfaces backend validation and business errors instead of generic catch-all text. */
export function formatApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    if (body?.errors?.length) {
      return body.errors.map((entry) => `${entry.field}: ${entry.message}`).join(". ");
    }
    if (body?.message) {
      return body.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
