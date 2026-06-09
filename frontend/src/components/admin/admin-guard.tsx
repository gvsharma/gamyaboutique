"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ROUTES } from "@/constants/routes";
import { fetchMe } from "@/lib/api/services/auth.service";
import { isAdmin } from "@/lib/auth/admin";
import { tokenStorage } from "@/lib/auth/token-storage";
import { useAuthStore } from "@/stores/auth-store";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = tokenStorage.get();
      if (!token) {
        router.replace(ROUTES.login);
        return;
      }

      try {
        const profile = await fetchMe();
        if (cancelled) return;
        setUser(profile);
        if (!isAdmin(profile)) {
          router.replace(ROUTES.home);
          return;
        }
        setReady(true);
      } catch {
        tokenStorage.clear();
        setUser(null);
        router.replace(ROUTES.login);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router, setUser]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-stone">
        Verifying admin access…
      </div>
    );
  }

  return <>{children}</>;
}
