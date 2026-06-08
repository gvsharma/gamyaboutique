import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";

export const metadata = { title: "About" };

const WHY_CHOOSE = [
  "Customized designs tailored to your style",
  "Perfect fitting with personal attention",
  "Designer blouses and women's fashion wear",
  "Kids wear stitching and customization",
  "Trendy designs with traditional elegance",
  "Quality craftsmanship and customer care",
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Our story</p>
      <h1 className="mt-2 font-display text-4xl text-burgundy">About {SITE_NAME}</h1>

      <div className="mt-8 space-y-6 text-stone leading-relaxed">
        <p>
          Welcome to <strong className="text-charcoal">{SITE_NAME}</strong>, where fashion meets
          comfort, elegance, and personal expression.
        </p>
        <p>
          At {SITE_NAME}, we believe every woman deserves clothing that not only looks beautiful but
          also feels perfect. We specialize in{" "}
          <strong className="text-charcoal">
            customized women&apos;s wear, designer blouses, kids wear, and personalized stitching
          </strong>
          , crafted to match your style, comfort, and occasion.
        </p>
        <p>
          Founded with a passion for solving one of the biggest challenges women face in fashion —{" "}
          <strong className="text-charcoal">finding the right fit with the right design</strong> —{" "}
          {SITE_NAME} brings together creativity, craftsmanship, and attention to detail. Whether it
          is a bridal blouse, festive wear, casual outfits, kids wear, or custom tailoring, we focus
          on creating outfits that feel uniquely yours.
        </p>
        <p>
          We work closely with experienced master tailors and skilled stitching professionals to
          deliver quality craftsmanship, elegant finishing, and modern designs tailored to your
          preferences. From the latest trends to timeless traditional styles, we ensure every piece
          reflects your personality and comfort.
        </p>

        <div>
          <h2 className="font-display text-2xl text-burgundy">Why Choose {SITE_NAME}?</h2>
          <ul className="mt-4 space-y-2">
            {WHY_CHOOSE.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-gold-muted" aria-hidden>
                  ✨
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p>
          At {SITE_NAME}, we are not just stitching clothes. We are building confidence, comfort,
          and beautiful experiences for every customer who walks through our doors.
        </p>
        <p>Visit us and experience fashion made just for you.</p>

        <div className="rounded-lg border border-burgundy/10 bg-cream/50 px-6 py-5">
          <p className="font-display text-lg text-burgundy">{SITE_NAME}</p>
          <p className="mt-2 text-sm">{CONTACT.addressShort}</p>
          <p className="mt-1 text-sm italic text-stone">{SITE_TAGLINE}</p>
        </div>
      </div>
    </div>
  );
}
