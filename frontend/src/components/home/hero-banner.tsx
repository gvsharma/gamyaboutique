import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_TAGLINE } from "@/constants/site";

export function HeroBanner() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-charcoal">
      <Image
        src="https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1800&q=85"
        alt="Elegant saree draping"
        fill
        priority
        className="object-cover object-center opacity-90 transition-transform duration-[8000ms] ease-out hover:scale-105"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-charcoal/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/50 to-transparent" />

      <div className="container-premium relative flex min-h-[92vh] flex-col justify-end pb-16 pt-32 sm:pb-24 sm:pt-40">
        <div className="max-w-2xl animate-fade-up">
          <p className="text-eyebrow text-pearl/80">New season · Handpicked</p>
          <h1 className="mt-5 font-display text-hero text-pearl text-balance">
            Couture woven for every celebration
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-pearl/75 sm:text-lg">
            {SITE_TAGLINE}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={ROUTES.shop}>
              <Button size="lg" variant="secondary">
                Shop collection
              </Button>
            </Link>
            <Link href={ROUTES.category("sarees")}>
              <Button
                size="lg"
                variant="outline"
                className="border-pearl/30 bg-pearl/10 text-pearl backdrop-blur-sm hover:bg-pearl/20"
              >
                Explore sarees
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
