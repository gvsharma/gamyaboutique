import { CONTACT, SITE_NAME, SITE_TAGLINE } from "@/constants/site";
import { SectionHeader } from "@/components/ui/section-header";

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
    <div className="container-premium py-16 sm:py-20 lg:py-24">
      <SectionHeader
        align="left"
        eyebrow="Our story"
        title={`About ${SITE_NAME}`}
        className="mb-12"
      />

      <div className="mx-auto max-w-3xl space-y-6 text-body">
        <p>
          Welcome to <strong className="font-medium text-charcoal">{SITE_NAME}</strong>, where fashion meets
          comfort, elegance, and personal expression.
        </p>
        <p>
          At {SITE_NAME}, we believe every woman deserves clothing that not only looks beautiful but
          also feels perfect. We specialize in{" "}
          <strong className="font-medium text-charcoal">
            customized women&apos;s wear, designer blouses, kids wear, and personalized stitching
          </strong>
          , crafted to match your style, comfort, and occasion.
        </p>
        <p>
          Founded with a passion for solving one of the biggest challenges women face in fashion —{" "}
          <strong className="font-medium text-charcoal">finding the right fit with the right design</strong> —{" "}
          {SITE_NAME} brings together creativity, craftsmanship, and attention to detail.
        </p>

        <div className="pt-4">
          <h2 className="font-display text-2xl text-charcoal">Why choose us?</h2>
          <ul className="mt-6 space-y-3">
            {WHY_CHOOSE.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-muted mt-10 px-6 py-6 sm:px-8">
          <p className="font-display text-xl text-charcoal">{SITE_NAME}</p>
          <p className="mt-2 text-sm text-stone">{CONTACT.addressShort}</p>
          <p className="mt-1 text-sm italic text-stone/80">{SITE_TAGLINE}</p>
        </div>
      </div>
    </div>
  );
}
