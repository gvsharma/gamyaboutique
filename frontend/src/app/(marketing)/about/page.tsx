import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { StoreMap } from "@/components/contact/store-map";
import { CoverHeroImage } from "@/components/ui/cover-hero-image";
import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "About" };

const STORY_IMAGES = {
  hero: "/brand/hero-saree.jpg",
  atelier: "/brand/story-atelier.jpg",
  celebration: "/brand/story-celebration.jpg",
  craft: "/brand/story-celebration.jpg",
} as const;

const VALUES = [
  {
    title: "Perfect fit",
    body: "Every blouse, lehenga, and girls' ensemble is measured, draped, and finished to sit beautifully on you — not just on a mannequin.",
  },
  {
    title: "Heritage craft",
    body: "We honour handloom silks, zari borders, and time-tested tailoring techniques passed down through generations of Indian couture.",
  },
  {
    title: "Celebration ready",
    body: "From wedding mornings to festival evenings, our collections are curated for the moments that deserve to be remembered.",
  },
  {
    title: "Made for families",
    body: "Mom-and-daughter sets, birthday frocks, and bridal trousseaus — dressing women and little girls with equal care and joy.",
  },
] as const;

function StoryImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <CoverHeroImage
      src={src}
      alt={alt}
      priority={priority}
      variant="editorial"
      className={className}
    />
  );
}

function StoryText({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-fade-up ${className}`}>
      <p className="text-eyebrow text-maroon">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl text-charcoal sm:text-3xl lg:text-[2rem]">{title}</h2>
      <div className="mt-5 space-y-4 text-body">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <section className="relative bg-linen">
        <div className="relative">
          <CoverHeroImage
            src={STORY_IMAGES.hero}
            alt="Elegant ethnic wear at Gamya Couture, Hyderabad"
            priority
            variant="editorial"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/45 to-charcoal/20" />
          <div className="container-premium absolute inset-0 flex items-center py-20 sm:py-24">
            <div className="animate-fade-up max-w-2xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-pearl/60">
                Our story · Hyderabad
              </p>
              <h1 className="mt-5 font-display text-hero text-pearl text-balance">
                A drape woven with intention
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-pearl/80 sm:text-lg">
                {SITE_NAME} began with a simple conviction: every woman and every little girl deserves
                ethnic wear that fits as beautifully as it looks — crafted with patience, pride, and
                the warmth of a family boutique.
              </p>
              <p className="mt-3 text-sm italic text-pearl/65">{SITE_TAGLINE}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our beginning */}
      <section className="container-premium py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <StoryImage
            src={STORY_IMAGES.craft}
            alt="Festive ethnic wear for family celebrations — Gamya Couture"
          />
          <div id="our-story" className="scroll-mt-40">
            <StoryText eyebrow="Our beginning" title="Rooted in Hyderabad, grown with love">
              <p>
                What started as a modest stitching studio in Green Homes Colony has blossomed into a
                boutique cherished by women across Hyderabad. We opened our doors with one promise:
                solve the everyday struggle of finding ethnic wear that truly fits.
              </p>
              <p>
                Word spread through weddings, housewarmings, and school festivals — mothers who found
                their perfect blouse here returned with their daughters for frocks and lehenga sets.
                That trust became the heart of {SITE_NAME}.
              </p>
              <p>
                Today, we remain a neighbourhood atelier at our core: unhurried consultations,
                honest guidance on fabric and drape, and garments finished only when they meet our
                own standards.
              </p>
            </StoryText>
          </div>
        </div>
      </section>

      {/* Craft & fit */}
      <section className="border-y border-rose/15 bg-pearl py-20 sm:py-28">
        <div className="container-premium">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20 lg:[&>div:first-child]:order-2">
            <StoryImage
              src={STORY_IMAGES.atelier}
              alt="Bridal lehenga and ethnic wear craftsmanship"
            />
            <StoryText eyebrow="Craft & fit" title="Where every stitch has a purpose">
              <p>
                Sarees, lehengas, designer blouses, and girls&apos; festive wear — each piece in our
                boutique is chosen for drape, comfort, and lasting elegance. We work with silks,
                cottons, and contemporary blends suited to Hyderabad&apos;s celebrations and climate.
              </p>
              <p>
                Our in-house tailoring team handles custom stitching and alterations with the same
                attention a couture house would offer: precise measurements, thoughtful finishing,
                and fittings until the silhouette feels unmistakably yours.
              </p>
              <p>
                Whether you need a bridal lehenga reshaped, a blouse tailored to your saree, or a
                birthday frock stitched overnight, we treat every request as a personal commission.
              </p>
              <Link
                href={ROUTES.customStitching()}
                className="mt-6 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon transition-colors hover:text-maroon-hover"
              >
                Explore custom stitching →
              </Link>
            </StoryText>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="editorial-panel py-20 sm:py-28">
        <div className="container-premium">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/55">
              What we believe
            </p>
            <h2 className="mt-4 font-display text-section-title text-pearl">Our philosophy</h2>
            <p className="mt-4 text-body text-pearl/70">
              At {SITE_NAME}, ethnic fashion is not merely about adornment — it is about confidence,
              heritage, and the joy of dressing for life&apos;s finest chapters.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="animate-fade-up border border-pearl/15 bg-pearl/5 px-6 py-8 backdrop-blur-sm"
              >
                <h3 className="font-display text-xl text-pearl">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-pearl/70">{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The boutique today */}
      <section className="container-premium py-20 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <StoryText eyebrow="The boutique today" title="A wardrobe for every celebration">
            <p>
              Walk into {SITE_NAME} and you will find curated racks of silk sarees, bridal and party
              lehengas, everyday cotton drapes, and a vibrant girls&apos; collection — frocks,
              lehenga sets, and matching looks for mothers and daughters.
            </p>
            <p>
              Our team guides you through colour, embellishment, and blouse pairing with the ease of
              a stylist and the honesty of a friend. Many of our customers have shopped with us
              through engagements, pregnancies, and their children&apos;s first festivals.
            </p>
            <p>
              We take special pride in bridal and festive ensembles — pieces that photograph
              beautifully, move gracefully, and become part of your family&apos;s story for years to
              come.
            </p>
            <Link
              href={ROUTES.shop}
              className="mt-6 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-maroon transition-colors hover:text-maroon-hover"
            >
              Shop collections →
            </Link>
          </StoryText>
          <StoryImage
            src={STORY_IMAGES.celebration}
            alt="Festive ethnic wear for celebrations"
          />
        </div>
      </section>

      {/* Promise strip */}
      <section className="border-y border-rose/15 bg-gradient-to-br from-maroon via-maroon-deep to-maroon py-16 sm:py-20">
        <div className="container-premium animate-fade-up text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/55">
            Our promise
          </p>
          <h2 className="mt-4 font-display text-2xl text-pearl sm:text-3xl">
            Thoughtfully chosen. Expertly stitched. Genuinely cared for.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-pearl/80 sm:text-base">
            When you choose {SITE_NAME}, you are not simply buying clothing — you are investing in
            pieces shaped by heritage craftsmanship, tailored to your form, and delivered with the
            warmth of a boutique that knows your name.
          </p>
        </div>
      </section>

      {/* Visit us */}
      <section className="container-premium py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-up">
            <p className="text-eyebrow text-maroon">Visit us</p>
            <h2 className="mt-3 font-display text-2xl text-charcoal sm:text-3xl">
              Step into {SITE_NAME}
            </h2>
            <p className="mt-5 text-body">
              We welcome you to our boutique in Nadargul, Hyderabad — for browsing, fittings, and
              bespoke consultations. Bring your saree for a blouse consultation, or simply arrive
              with an occasion in mind.
            </p>
            <div className="mt-8 flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-maroon/70" strokeWidth={1.5} />
              <div>
                <p className="font-display text-lg text-charcoal">{SITE_NAME}</p>
                <p className="mt-2 text-sm text-stone">{CONTACT.address}</p>
                <p className="mt-1 text-sm italic text-stone/80">{SITE_TAGLINE}</p>
                <p className="mt-3 text-sm text-stone">{CONTACT.businessHours}</p>
              </div>
            </div>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-maroon transition-colors hover:text-maroon-deep"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <div className="mt-8">
              <Link href={ROUTES.contact} className="btn-editorial-primary !text-charcoal">
                Contact us
              </Link>
            </div>
          </div>
          <div className="surface-muted overflow-hidden px-0 py-0">
            <StoreMap className="!mt-0 !rounded-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
