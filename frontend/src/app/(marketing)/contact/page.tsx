import { CONTACT, SITE_NAME } from "@/constants/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Connect</p>
      <h1 className="mt-2 font-display text-4xl text-burgundy">Contact us</h1>

      <div className="mt-8 space-y-6 text-stone">
        <p>
          Visit {SITE_NAME} in Hyderabad for customized women&apos;s wear, designer blouses, kids
          wear, and personalized stitching. Walk in or call ahead — we&apos;d love to help you find
          the perfect fit.
        </p>

        <ul className="space-y-4 text-charcoal">
          <li>
            <span className="block text-xs font-medium uppercase tracking-wider text-burgundy">
              Phone
            </span>
            <a href={CONTACT.phoneHref} className="text-burgundy hover:underline">
              {CONTACT.phoneDisplay}
            </a>
          </li>
          <li>
            <span className="block text-xs font-medium uppercase tracking-wider text-burgundy">
              Address
            </span>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-burgundy hover:underline"
            >
              {CONTACT.address}
            </a>
          </li>
          <li>
            <span className="block text-xs font-medium uppercase tracking-wider text-burgundy">
              Instagram
            </span>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-burgundy hover:underline"
            >
              {CONTACT.instagramHandle}
            </a>
          </li>
        </ul>

        <p className="text-sm">
          For a specific piece on our website, use <strong>Express your interest</strong> on the
          product page — our team responds within one business day.
        </p>
      </div>
    </div>
  );
}
