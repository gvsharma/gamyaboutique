import { SITE_NAME } from "@/constants/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Connect</p>
      <h1 className="mt-2 font-display text-4xl text-burgundy">Contact us</h1>
      <div className="mt-8 space-y-6 text-stone">
        <p>
          Visit {SITE_NAME} by appointment in Hyderabad, or reach out to plan a virtual styling
          session.
        </p>
        <ul className="space-y-3 text-charcoal">
          <li>
            <span className="font-medium">Email:</span>{" "}
            <a href="mailto:hello@gamyacouture.com" className="text-burgundy hover:underline">
              hello@gamyacouture.com
            </a>
          </li>
          <li>
            <span className="font-medium">Phone:</span> +91 98765 43210
          </li>
          <li>
            <span className="font-medium">Hours:</span> Tue–Sun, 11am – 7pm
          </li>
        </ul>
        <p className="text-sm">
          For a specific piece, use <strong>Express your interest</strong> on the product page —
          our team responds within one business day.
        </p>
      </div>
    </div>
  );
}
