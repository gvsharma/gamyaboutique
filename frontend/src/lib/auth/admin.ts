import type { UserProfile } from "@/types/auth";

export function isAdmin(user: UserProfile | null | undefined): boolean {
  return user?.roles?.includes("ADMIN") ?? false;
}
