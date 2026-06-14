"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchRecentlyViewedFromApi,
  fetchRecentlyViewedFromGuestStorage,
} from "@/lib/api/services/recently-viewed.service";
import { tokenStorage } from "@/lib/auth/token-storage";
import { queryKeys } from "@/lib/query/query-keys";

export function useRecentlyViewed() {
  return useQuery({
    queryKey: queryKeys.recentlyViewed(),
    queryFn: async () => {
      if (tokenStorage.get()) {
        return fetchRecentlyViewedFromApi();
      }
      return fetchRecentlyViewedFromGuestStorage();
    },
    staleTime: 60_000,
  });
}
