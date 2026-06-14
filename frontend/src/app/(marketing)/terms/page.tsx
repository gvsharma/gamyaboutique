import { PolicyPageContent } from "@/components/marketing/policy-page-content";
import { fetchPolicy } from "@/lib/api/services/policy.service";

export const metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const policy = await fetchPolicy("terms");
  return <PolicyPageContent policy={policy} />;
}
