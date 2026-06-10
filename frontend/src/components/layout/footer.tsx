import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-charcoal/5 bg-ivory/50">
      <div className="container-premium grid gap-12 py-16 md:grid-cols-3 lg:py-20">
        <div>
          <p className="font-display text-2xl text-charcoal">{SITE_NAME}</p>
          <p className="mt-3 max-w-xs text-body">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="text-eyebrow text-maroon">Explore</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link href={ROUTES.shop} className="link-subtle">All collections</Link></li>
            <li><Link href={ROUTES.category("sarees")} className="link-subtle">Sarees</Link></li>
            <li><Link href={ROUTES.category("lehengas")} className="link-subtle">Lehengas</Link></li>
            <li><Link href={ROUTES.category("bridal")} className="link-subtle">Bridal</Link></li>
            <li><Link href={ROUTES.about} className="link-subtle">Our story</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-eyebrow text-maroon">Visit us</p>
          <div className="mt-5 space-y-3 text-sm text-stone">
            <p>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-subtle">
                {CONTACT.address}
              </a>
            </p>
            <p>
              <a href={CONTACT.phoneHref} className="link-subtle">{CONTACT.phoneDisplay}</a>
            </p>
            <p>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="link-subtle">
                {CONTACT.instagramHandle}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-charcoal/5 py-6 text-center text-xs text-stone/80">
        © {new Date().getFullYear()} {SITE_NAME}. Crafted with care in Hyderabad.
      </div>
    </footer>
  );
}
