import { PolicyPageContent } from "@/components/marketing/policy-page-content";
import { fetchPolicy } from "@/lib/api/services/policy.service";

export const metadata = { title: "Shipping Policy" };

export default async function ShippingPage() {
  const policy = await fetchPolicy("shipping");
  return <PolicyPageContent policy={policy} />;
}
