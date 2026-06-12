"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { fetchMe } from "@/lib/api/services/auth.service";
import { isAdmin } from "@/lib/auth/admin";
import { tokenStorage } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!tokenStorage.get()) {
      router.replace(`${ROUTES.login}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!user) {
      fetchMe()
        .then((profile) => {
          if (isAdmin(profile)) {
            router.replace(ROUTES.admin.home);
            return;
          }
          setUser(profile);
        })
        .catch(() => {
          tokenStorage.clear();
          router.replace(ROUTES.login);
        });
    }
  }, [user, router, setUser]);

  if (!user) {
    return <p className="px-4 py-16 text-center text-stone">Loading account…</p>;
  }

  return <>{children}</>;
}
