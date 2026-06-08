import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { SITE_NAME, SITE_TAGLINE } from "@/constants/site";

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
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-burgundy">
            Visit
          </p>
          <p className="mt-4 text-sm text-stone">
            Hyderabad, Telangana
            <br />
            By appointment —{" "}
            <Link href={ROUTES.contact} className="text-burgundy underline-offset-2 hover:underline">
              contact us
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-burgundy/10 py-6 text-center text-xs text-stone">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
