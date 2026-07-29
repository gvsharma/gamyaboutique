import Image from "next/image";
import Link from "next/link";
import { BoutiqueTrustLine } from "@/components/home/boutique-trust-line";
import { ROUTES } from "@/constants/routes";
import { SITE_TAGLINE, whatsappHref } from "@/constants/site";

const HERO_IMAGE = "/brand/hero-saree.jpg";

export function HeroBanner() {
  return (
    <>
      <section className="grid min-h-[min(88vh,48rem)] lg:grid-cols-2">
        <div className="editorial-panel flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
          <div className="animate-fade-up max-w-lg">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-pearl/55">
              Hyderabad atelier · Women &amp; girls
            </p>
            <h1 className="mt-6 font-display text-hero text-pearl text-balance">
              Bespoke Indian couture, perfected to your fit
            </h1>
            <p className="mt-6 text-base leading-relaxed text-pearl/75 sm:text-lg">
              {SITE_TAGLINE}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={ROUTES.contact} className="btn-editorial-primary">
                Book consultation
              </Link>
              <Link href={ROUTES.shopCollections} className="btn-editorial-outline">
                Explore collections
              </Link>
            </div>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-[11px] font-medium uppercase tracking-[0.14em] text-pearl/55 transition-colors hover:text-pearl"
            >
              Or message us on WhatsApp
            </a>
          </div>
        </div>

        <div className="relative min-h-[22rem] bg-warm lg:min-h-full">
          <Image
            src={HERO_IMAGE}
            alt="Elegant ethnic wear — Gamya Couture"
            fill
            priority
            className="object-cover object-center animate-slow-zoom"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>
      <BoutiqueTrustLine />
    </>
  );
}
