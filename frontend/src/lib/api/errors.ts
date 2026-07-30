import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: { message?: string }[] } | undefined;
    const message = data?.message?.trim();
    if (message) return message;
    const fieldErrors = data?.errors
      ?.map((e) => e.message?.trim())
      .filter(Boolean)
      .join("; ");
    if (fieldErrors) return fieldErrors;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
