import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { CONTACT } from "@/constants/site";
import type { SitePolicy } from "@/types/site-policy";

function formatUpdatedAt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PolicyPageContent({ policy }: { policy: SitePolicy }) {
  return (
    <div className="container-premium py-16 sm:py-20 lg:py-24">
      <SectionHeader align="left" eyebrow="Legal" title={policy.title} className="mb-4" />
      <p className="mb-12 text-sm text-stone">Last updated on {formatUpdatedAt(policy.updatedAt)}</p>

      <div className="mx-auto max-w-3xl whitespace-pre-wrap text-body">{policy.content}</div>

      <p className="mx-auto mt-10 max-w-3xl text-sm text-stone">
        Questions?{" "}
        <Link href={ROUTES.contact} className="font-medium text-maroon hover:underline">
          Contact us
        </Link>{" "}
        or email{" "}
        <a href={`mailto:${CONTACT.supportEmail}`} className="font-medium text-maroon hover:underline">
          {CONTACT.supportEmail}
        </a>
        .
      </p>
    </div>
  );
}
