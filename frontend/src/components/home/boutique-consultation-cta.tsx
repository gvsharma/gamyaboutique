import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { whatsappHref } from "@/constants/site";

export function BoutiqueConsultationCta() {
  return (
    <section className="editorial-panel section-luxury">
      <div className="container-premium grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-pearl/55">
            The atelier experience
          </p>
          <h2 className="mt-4 font-display text-section-title text-pearl text-balance">
            Bespoke consultations by appointment
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-pearl/70">
            From bridal trousseaus to festive sarees — our Hyderabad team guides you through fabric,
            drape, and embellishment in a private setting.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <Link href={ROUTES.contact} className="btn-editorial-primary">
            Book appointment
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
    </section>
  );
}
