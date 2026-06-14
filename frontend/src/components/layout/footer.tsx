import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { SupportDialogLink } from "@/components/layout/contact-support-dialog";
import { ROUTES } from "@/constants/routes";
import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-rose/25 bg-gradient-to-b from-pink-soft via-rose-soft/80 to-pink-mist text-charcoal">
      <div className="container-premium grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5 lg:gap-8 lg:py-20">
        <div className="lg:col-span-1">
          <p className="font-display text-2xl tracking-tight text-maroon">{SITE_NAME}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/70">{SITE_TAGLINE}</p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/45">
            Collections
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href={ROUTES.shopNewArrivals} className="text-charcoal/75 transition-colors hover:text-maroon">
                New arrivals
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("sarees")} className="text-charcoal/75 transition-colors hover:text-maroon">
                Sarees
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("lehengas")} className="text-charcoal/75 transition-colors hover:text-maroon">
                Lehengas
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("girls-collection")} className="text-charcoal/75 transition-colors hover:text-maroon">
                Girls collection
              </Link>
            </li>
            <li>
              <Link href={ROUTES.customStitching()} className="text-charcoal/75 transition-colors hover:text-maroon">
                Custom stitching
              </Link>
            </li>
            <li>
              <Link href={ROUTES.aboutStory} className="text-charcoal/75 transition-colors hover:text-maroon">
                Our story
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/45">
            Customer care
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href={ROUTES.contact} className="text-charcoal/75 transition-colors hover:text-maroon">
                Contact us
              </Link>
            </li>
            <li>
              <SupportDialogLink className="text-charcoal/75 transition-colors hover:text-maroon">
                Contact &amp; support
              </SupportDialogLink>
            </li>
            <li>
              <Link href={ROUTES.account} className="text-charcoal/75 transition-colors hover:text-maroon">
                My account
              </Link>
            </li>
            <li>
              <Link href={ROUTES.wishlist} className="text-charcoal/75 transition-colors hover:text-maroon">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/45">
            Policies
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href={ROUTES.privacy} className="text-charcoal/75 transition-colors hover:text-maroon">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href={ROUTES.contact} className="text-charcoal/75 transition-colors hover:text-maroon">
                Contact information
              </Link>
            </li>
            <li>
              <Link href={ROUTES.returns} className="text-charcoal/75 transition-colors hover:text-maroon">
                Refund policy
              </Link>
            </li>
            <li>
              <Link href={ROUTES.terms} className="text-charcoal/75 transition-colors hover:text-maroon">
                Terms of service
              </Link>
            </li>
            <li>
              <Link href={ROUTES.shipping} className="text-charcoal/75 transition-colors hover:text-maroon">
                Shipping policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-charcoal/45">
            Visit us
          </p>
          <div className="mt-5 space-y-4 text-sm text-charcoal/75">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-maroon/50" strokeWidth={1.5} />
              <a
                href={CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-maroon"
              >
                {CONTACT.address}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-maroon/50" strokeWidth={1.5} />
              <a href={CONTACT.phoneHref} className="transition-colors hover:text-maroon">
                {CONTACT.phoneDisplay}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Instagram className="h-4 w-4 shrink-0 text-maroon/50" strokeWidth={1.5} />
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-maroon"
              >
                {CONTACT.instagramHandle}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-rose/20">
        <div className="container-premium flex flex-col items-center justify-between gap-3 py-6 text-xs text-charcoal/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME}. Crafted with care in Hyderabad.</p>
          <p className="tracking-wide">Luxury Indian couture for women &amp; girls</p>
        </div>
      </div>
    </footer>
  );
}
