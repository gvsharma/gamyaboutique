import { PolicyPageContent } from "@/components/marketing/policy-page-content";
import { fetchPolicy } from "@/lib/api/services/policy.service";

export const metadata = { title: "Return Policy" };

export default async function ReturnsPage() {
  const policy = await fetchPolicy("return");
  return <PolicyPageContent policy={policy} />;
}
