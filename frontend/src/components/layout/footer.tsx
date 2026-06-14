import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-charcoal text-pearl">
      <div className="container-premium grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:py-20">
        <div className="lg:col-span-1">
          <p className="font-display text-2xl tracking-tight">{SITE_NAME}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-pearl/65">{SITE_TAGLINE}</p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pearl/50">
            Collections
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href={ROUTES.shopNewArrivals} className="text-pearl/75 transition-colors hover:text-mustard">
                New arrivals
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("sarees")} className="text-pearl/75 transition-colors hover:text-mustard">
                Sarees
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("lehengas")} className="text-pearl/75 transition-colors hover:text-mustard">
                Lehengas
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("girls-collection")} className="text-pearl/75 transition-colors hover:text-mustard">
                Girls collection
              </Link>
            </li>
            <li>
              <Link href={ROUTES.customStitching()} className="text-pearl/75 transition-colors hover:text-mustard">
                Custom stitching
              </Link>
            </li>
            <li>
              <Link href={ROUTES.aboutStory} className="text-pearl/75 transition-colors hover:text-mustard">
                Our story
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pearl/50">
            Customer care
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href={ROUTES.contact} className="text-pearl/75 transition-colors hover:text-mustard">
                Contact us
              </Link>
            </li>
            <li>
              <Link href={ROUTES.account} className="text-pearl/75 transition-colors hover:text-mustard">
                My account
              </Link>
            </li>
            <li>
              <Link href={ROUTES.wishlist} className="text-pearl/75 transition-colors hover:text-mustard">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pearl/50">
            Visit us
          </p>
          <div className="mt-5 space-y-4 text-sm text-pearl/75">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pearl/40" strokeWidth={1.5} />
              <a
                href={CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-mustard"
              >
                {CONTACT.address}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-pearl/40" strokeWidth={1.5} />
              <a href={CONTACT.phoneHref} className="transition-colors hover:text-pearl">
                {CONTACT.phoneDisplay}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Instagram className="h-4 w-4 shrink-0 text-pearl/40" strokeWidth={1.5} />
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-mustard"
              >
                {CONTACT.instagramHandle}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-pearl/10">
        <div className="container-premium flex flex-col items-center justify-between gap-3 py-6 text-xs text-pearl/45 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME}. Crafted with care in Hyderabad.</p>
          <p className="tracking-wide">Luxury Indian couture</p>
        </div>
      </div>
    </footer>
  );
}
