import { PolicyPageContent } from "@/components/marketing/policy-page-content";
import { fetchPolicy } from "@/lib/api/services/policy.service";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const policy = await fetchPolicy("privacy");
  return <PolicyPageContent policy={policy} />;
}
