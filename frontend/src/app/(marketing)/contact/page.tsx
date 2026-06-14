import Link from "next/link";
import { ExternalLink, MessageCircle, MapPin, Phone, Instagram } from "lucide-react";
import { StoreMap } from "@/components/contact/store-map";
import { CONTACT, SITE_NAME, whatsappHref } from "@/constants/site";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <div className="editorial-panel py-16 sm:py-20">
        <div className="container-premium max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/55">Connect</p>
          <h1 className="mt-4 font-display text-section-title text-pearl">Visit our boutique</h1>
          <p className="mt-4 max-w-xl text-body text-pearl/75">
            {SITE_NAME} in Hyderabad — customized women&apos;s wear, designer blouses, girls wear, and
            personalized stitching.
          </p>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-editorial-primary mt-8 inline-flex gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp enquiry
          </a>
        </div>
      </div>

      <div className="container-premium py-16 sm:py-20">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="border border-charcoal/8 bg-pearl p-6">
            <Phone className="h-5 w-5 text-maroon" strokeWidth={1.5} />
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-stone">Phone</p>
            <a href={CONTACT.phoneHref} className="mt-2 block text-sm font-medium text-charcoal hover:text-maroon">
              {CONTACT.phoneDisplay}
            </a>
          </div>
          <div className="border border-charcoal/8 bg-pearl p-6">
            <MapPin className="h-5 w-5 text-maroon" strokeWidth={1.5} />
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-stone">Address</p>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-charcoal/75 hover:text-maroon"
            >
              {CONTACT.addressShort}
            </a>
          </div>
          <div className="border border-charcoal/8 bg-pearl p-6">
            <Instagram className="h-5 w-5 text-maroon" strokeWidth={1.5} />
            <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-stone">Instagram</p>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-charcoal/75 hover:text-maroon"
            >
              {CONTACT.instagramHandle}
            </a>
          </div>
        </div>

        <section className="mx-auto mt-16 max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone">Find us</p>
          <h2 className="mt-3 font-display text-2xl text-charcoal sm:text-3xl">Visit {SITE_NAME}</h2>
          <p className="mt-4 text-body text-charcoal/75">{CONTACT.address}</p>
          <a
            href={CONTACT.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-maroon transition-colors hover:text-maroon-deep"
          >
            Open in Google Maps
            <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          </a>
          <StoreMap className="mt-8" />
        </section>

        <p className="mx-auto mt-12 max-w-2xl text-center text-body">
          For a specific piece, use <strong className="font-medium text-charcoal">Express your interest</strong> on
          the product page — or{" "}
          <Link href={ROUTES.customStitching("appointment")} className="text-maroon hover:underline">
            book a stitching appointment
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
