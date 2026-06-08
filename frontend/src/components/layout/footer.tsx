import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-burgundy/10 bg-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-xl text-burgundy">{SITE_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-stone">{SITE_TAGLINE}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-stone">
            <li>
              <Link href={ROUTES.shop} className="hover:text-burgundy">
                All collections
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("sarees")} className="hover:text-burgundy">
                Sarees
              </Link>
            </li>
            <li>
              <Link href={ROUTES.category("bridal")} className="hover:text-burgundy">
                Bridal
              </Link>
            </li>
            <li>
              <Link href={ROUTES.about} className="hover:text-burgundy">
                About us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            Visit
          </p>
          <div className="mt-4 space-y-2 text-sm text-stone">
            <p>
              <a
                href={CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-burgundy"
              >
                {CONTACT.address}
              </a>
            </p>
            <p>
              <a href={CONTACT.phoneHref} className="hover:text-burgundy">
                {CONTACT.phoneDisplay}
              </a>
            </p>
            <p>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-burgundy"
              >
                {CONTACT.instagramHandle}
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-burgundy/10 py-6 text-center text-xs text-stone">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
