import { serverFetch } from "@/lib/api/server-fetch";
import { API } from "@/lib/api/endpoints";
import type { PolicyKey, SitePolicy } from "@/types/site-policy";

export async function fetchPolicy(key: PolicyKey): Promise<SitePolicy> {
  return serverFetch<SitePolicy>(API.policy(key));
}
