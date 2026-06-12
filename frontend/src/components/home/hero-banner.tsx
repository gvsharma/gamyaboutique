import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_TAGLINE } from "@/constants/site";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-warm">
      <div className="container-premium">
        <div className="grid min-h-[88vh] items-center lg:grid-cols-2 lg:gap-8">
          {/* Editorial copy */}
          <div className="relative z-10 flex flex-col justify-center py-16 lg:py-24 lg:pr-8">
            <div className="animate-fade-up">
              <p className="text-eyebrow">New season · Handpicked</p>
              <h1 className="mt-5 font-display text-hero text-charcoal text-balance">
                Couture woven for every celebration
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-stone sm:text-lg">
                {SITE_TAGLINE}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={ROUTES.shop}>
                  <Button size="lg" variant="primary">
                    Shop collection
                  </Button>
                </Link>
                <Link href={ROUTES.category("sarees")}>
                  <Button size="lg" variant="outline">
                    Explore sarees
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Hero imagery */}
          <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:min-h-[88vh]">
            <Image
              src="https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1800&q=85"
              alt="Elegant saree draping"
              fill
              priority
              className="object-cover object-center animate-slow-zoom"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-warm/20 lg:bg-gradient-to-r lg:from-warm/30 lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
