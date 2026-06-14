import Image from "next/image";
import Link from "next/link";
import { TrustBar } from "@/components/home/trust-bar";
import { ROUTES } from "@/constants/routes";
import { SITE_TAGLINE, whatsappHref } from "@/constants/site";

export function HeroBanner() {
  return (
    <>
      <section className="grid min-h-[min(92vh,52rem)] lg:grid-cols-2">
        {/* Editorial copy panel — olive + maroon boutique mix */}
        <div className="editorial-panel flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-14 lg:py-24 xl:px-20">
          <div className="animate-fade-up max-w-lg">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-pearl/55">
              New season · Women &amp; girls
            </p>
            <h1 className="mt-6 font-display text-hero text-pearl text-balance">
              Couture woven for every celebration
            </h1>
            <p className="mt-6 text-base leading-relaxed text-pearl/75 sm:text-lg">
              {SITE_TAGLINE}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={ROUTES.shop} className="btn-editorial-primary">
                Shop collection
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-outline"
              >
                WhatsApp enquiry
              </a>
            </div>
          </div>
        </div>

        {/* Hero imagery — clean editorial crop */}
        <div className="relative min-h-[24rem] bg-warm lg:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1800&q=85"
            alt="Elegant saree — Gamya Couture"
            fill
            priority
            className="object-cover object-top animate-slow-zoom"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>
      <TrustBar />
    </>
  );
}
