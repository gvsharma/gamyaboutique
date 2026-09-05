import axios from "axios";
import type { ApiResponse } from "@/types/api";

/** Surfaces backend validation and business errors instead of generic catch-all text. */
export function getApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    if (body?.errors?.length) {
      const formatted = body.errors
        .map((entry) =>
          entry.field ? `${entry.field}: ${entry.message}` : entry.message,
        )
        .filter(Boolean)
        .join(". ");
      if (formatted) return formatted;
    }
    const message = body?.message?.trim();
    if (message) return message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
