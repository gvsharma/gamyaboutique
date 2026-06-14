import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { PolicyKey, SitePolicy } from "@/types/site-policy";

const POLICY_TITLES: Record<PolicyKey, string> = {
  privacy: "Privacy Policy",
  shipping: "Shipping Policy",
  return: "Return Policy",
  terms: "Terms of Service",
};

const OFFLINE_POLICY_CONTENT =
  "Policy content is temporarily unavailable. Please check back shortly or contact us for assistance.";

export async function fetchPolicy(key: PolicyKey): Promise<SitePolicy> {
  try {
    return await serverFetch<SitePolicy>(API.policy(key));
  } catch {
    return {
      key,
      title: POLICY_TITLES[key],
      content: OFFLINE_POLICY_CONTENT,
      updatedAt: "",
    };
  }
}
