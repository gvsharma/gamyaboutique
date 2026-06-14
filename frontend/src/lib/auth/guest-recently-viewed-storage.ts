const RECENTLY_VIEWED_KEY = "gamya_recently_viewed_ids";
const MAX_ITEMS = 20;

export const guestRecentlyViewedStorage = {
  getIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  },

  record(productId: string): void {
    if (typeof window === "undefined") return;
    const ids = this.getIds().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  },

  clear() {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  },
};
