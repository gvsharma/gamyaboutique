import { CONTACT, SITE_NAME } from "@/constants/site";
import { SectionHeader } from "@/components/ui/section-header";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-premium py-16 sm:py-20 lg:py-24">
      <SectionHeader
        align="left"
        eyebrow="Connect"
        title="Contact us"
        description={`Visit ${SITE_NAME} in Hyderabad for customized women's wear, designer blouses, and personalized stitching.`}
        className="mb-12"
      />

      <div className="mx-auto max-w-2xl space-y-8">
        <ul className="space-y-6">
          <li className="admin-card !p-5">
            <p className="text-eyebrow text-maroon">Phone</p>
            <a href={CONTACT.phoneHref} className="mt-2 block text-lg text-charcoal link-subtle">
              {CONTACT.phoneDisplay}
            </a>
          </li>
          <li className="admin-card !p-5">
            <p className="text-eyebrow text-maroon">Address</p>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-body link-subtle"
            >
              {CONTACT.address}
            </a>
          </li>
          <li className="admin-card !p-5">
            <p className="text-eyebrow text-maroon">Instagram</p>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-body link-subtle"
            >
              {CONTACT.instagramHandle}
            </a>
          </li>
        </ul>

        <p className="text-body">
          For a specific piece on our website, use <strong className="font-medium text-charcoal">Express your interest</strong> on the
          product page — our team responds within one business day.
        </p>
      </div>
    </div>
  );
}
