const GUEST_CART_KEY = "gamya_guest_cart_id";

export const guestCartStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    let id = localStorage.getItem(GUEST_CART_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(GUEST_CART_KEY, id);
    }
    return id;
  },
  clear() {
    localStorage.removeItem(GUEST_CART_KEY);
  },
};
