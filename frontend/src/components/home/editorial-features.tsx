import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const FEATURES = [
  {
    num: "01",
    title: "Custom stitching",
    body: "Blouse, lehenga, and bridal alterations tailored to your measurements — crafted in our Hyderabad boutique.",
    href: ROUTES.customStitching(),
    image: "/brand/editorial-custom-stitching.jpg",
    alt: "Detail of hand embroidery on ethnic wear",
  },
  {
    num: "02",
    title: "Girls collection",
    body: "Frocks, lehenga sets, and mom-and-daughter matching looks for festivals, birthdays, and celebrations.",
    href: ROUTES.category("girls"),
    image: "/brand/editorial-girls-festive.jpg",
    alt: "Girls festive ethnic wear",
  },
  {
    num: "03",
    title: "Heritage craftsmanship",
    body: "Silk sarees, bridal lehengas, and heirloom pieces — selected for drape, comfort, and timeless elegance.",
    href: ROUTES.category("sarees"),
    image: "/brand/editorial-silk-drape.jpg",
    alt: "Silk saree drape detail",
  },
] as const;

export function EditorialFeatures() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="container-premium">
        <div className="max-w-xl">
          <p className="text-eyebrow text-maroon">The boutique difference</p>
          <h2 className="mt-3 font-display text-section-title text-charcoal">
            The difference is in the details
          </h2>
        </div>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.num}
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <p className="editorial-number">{feature.num}</p>
                <h3 className="mt-4 font-display text-2xl text-charcoal sm:text-3xl">{feature.title}</h3>
                <p className="mt-4 max-w-md text-body">{feature.body}</p>
                <Link
                  href={feature.href}
                  className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon transition-colors hover:text-maroon-hover"
                >
                  Explore →
                </Link>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden bg-linen sm:aspect-[5/4]">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  fill
                  className="object-cover transition-transform duration-700 ease-premium hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
