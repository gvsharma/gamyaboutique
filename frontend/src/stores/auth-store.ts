import { create } from "zustand";
import { tokenStorage } from "@/lib/auth/token-storage";
import type { UserProfile } from "@/types/auth";

interface AuthState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    tokenStorage.clear();
    set({ user: null });
  },
}));
