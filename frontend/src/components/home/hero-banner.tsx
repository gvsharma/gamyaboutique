import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { SITE_TAGLINE } from "@/constants/site";

export function HeroBanner() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-burgundy-dark">
      <Image
        src="https://images.unsplash.com/photo-1583391734527-658aeeef0f35?w=1600&q=80"
        alt="Elegant saree draping"
        fill
        priority
        className="object-cover opacity-60"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-burgundy-dark/90 via-burgundy-dark/50 to-transparent" />
      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">
          New season
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">
          Timeless couture, woven for you
        </h1>
        <p className="mt-6 max-w-lg text-base text-cream/80 sm:text-lg">{SITE_TAGLINE}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href={ROUTES.shop}>
            <Button size="lg" variant="secondary">
              Shop collection
            </Button>
          </Link>
          <Link href={ROUTES.category("sarees")}>
            <Button size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream/10">
              Explore sarees
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
