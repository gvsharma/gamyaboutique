import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function BoutiqueStory() {
  return (
    <section className="section-luxury bg-cream">
      <div className="container-premium">
        <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden bg-linen sm:aspect-[5/4]">
            <Image
              src="/brand/editorial-custom-stitching.jpg"
              alt="Detail of hand embroidery on ethnic wear"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-eyebrow text-maroon">The boutique difference</p>
            <h2 className="mt-4 font-display text-section-title text-charcoal">
              Crafted in Hyderabad, fitted to you
            </h2>
            <p className="mt-5 max-w-md text-body">
              From silk sarees to girls festive wear, every piece is chosen for drape, comfort, and
              timeless elegance. Our atelier handles blouse stitching, lehenga alterations, and
              bridal customization with the same care as our ready-to-wear edits.
            </p>
            <Link
              href={ROUTES.aboutStory}
              className="mt-10 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon transition-colors hover:text-maroon-hover"
            >
              Read our story →
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
