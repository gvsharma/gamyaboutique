export interface Address {
  id: string;
  addressType: "SHIPPING" | "BILLING" | "OTHER";
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  addresses: Address[];
}
