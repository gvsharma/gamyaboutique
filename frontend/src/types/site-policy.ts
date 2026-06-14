export type PolicyKey = "privacy" | "shipping" | "return" | "terms";

export interface SitePolicy {
  key: PolicyKey;
  title: string;
  content: string;
  updatedAt: string;
}

export interface UpdateSitePolicyPayload {
  title: string;
  content: string;
}
