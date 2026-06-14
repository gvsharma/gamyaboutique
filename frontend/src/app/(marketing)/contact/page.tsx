import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import { StoreMap } from "@/components/contact/store-map";
import { SupportDialogLink } from "@/components/layout/contact-support-dialog";
import { CONTACT, SITE_NAME, SITE_TAGLINE, whatsappHref } from "@/constants/site";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const metadata = { title: "Contact" };

const SOCIAL_CHANNELS = [
  {
    label: "WhatsApp",
    href: whatsappHref(),
    icon: MessageCircle,
    external: true,
  },
  {
    label: "Instagram",
    href: CONTACT.instagramUrl,
    icon: Instagram,
    external: true,
  },
  {
    label: "YouTube",
    href: CONTACT.youtubeUrl,
    icon: Youtube,
    external: true,
  },
] as const;

function SocialIconRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {SOCIAL_CHANNELS.map(({ label, href, icon: Icon, external }) => (
        <a
          key={label}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group flex items-center gap-2.5 text-sm text-charcoal/75 transition-colors hover:text-maroon"
          aria-label={label}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-rose/25 bg-pearl shadow-soft transition-colors group-hover:border-maroon/30 group-hover:bg-pink-soft/60">
            <Icon className="h-4 w-4 text-maroon/60 transition-colors group-hover:text-maroon" strokeWidth={1.5} />
          </span>
          <span className="font-medium">{label}</span>
        </a>
      ))}
    </div>
  );
}

function ContactDetail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-pearl/50" strokeWidth={1.5} />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-pearl/55">{label}</p>
        <div className="mt-1.5 text-sm leading-relaxed text-pearl/90">{children}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <section className="border-b border-rose/15 bg-gradient-to-b from-pearl via-pink-soft/50 to-cream py-16 sm:py-20">
        <div className="container-premium text-center">
          <p className="text-eyebrow text-maroon/70">Get in touch</p>
          <h1 className="mt-4 font-display text-section-title text-charcoal">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-body">
            Visit {SITE_NAME} in Hyderabad for customized women&apos;s wear, designer blouses, girls wear,
            and personalized stitching — or reach us anytime on WhatsApp.
          </p>
          <SocialIconRow className="mt-10 justify-center" />
        </div>
      </section>

      <section className="bg-gradient-to-br from-maroon via-maroon-deep to-maroon text-pearl">
        <div className="container-premium grid gap-12 py-16 md:grid-cols-2 lg:gap-20 lg:py-20">
          <div>
            <h2 className="font-display text-2xl text-pearl sm:text-3xl">Contact</h2>
            <div className="mt-8 space-y-6">
              <ContactDetail icon={MapPin} label="Store address">
                <a
                  href={CONTACT.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-pearl"
                >
                  {CONTACT.address}
                </a>
              </ContactDetail>
              <ContactDetail icon={Clock} label="Store hours">
                {CONTACT.businessHours}
              </ContactDetail>
              <ContactDetail icon={Phone} label="Phone">
                <a href={CONTACT.phoneHref} className="transition-colors hover:text-pearl">
                  {CONTACT.phoneDisplay}
                </a>
              </ContactDetail>
              <ContactDetail icon={Mail} label="Email">
                <a
                  href={`mailto:${CONTACT.supportEmail}`}
                  className="transition-colors hover:text-pearl"
                >
                  {CONTACT.supportEmail}
                </a>
              </ContactDetail>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl text-pearl sm:text-3xl">About {SITE_NAME}</h2>
            <p className="mt-6 text-sm leading-relaxed text-pearl/85 sm:text-[0.9375rem]">
              Find the perfect outfit for any occasion at our boutique in Hyderabad. We specialize in
              sarees, lehengas, designer blouses, girls wear, and custom stitching. {SITE_TAGLINE}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                WhatsApp enquiry
              </a>
              <SupportDialogLink className="inline-flex items-center rounded-xl border border-pearl/25 bg-pearl/10 px-5 py-3 text-sm font-medium text-pearl transition-colors hover:border-pearl/40 hover:bg-pearl/15">
                Contact &amp; support
              </SupportDialogLink>
            </div>

            <div className="mt-10 border-t border-pearl/15 pt-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-pearl/55">
                Follow us
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                {SOCIAL_CHANNELS.map(({ label, href, icon: Icon, external }) => (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-2 text-sm text-pearl/80 transition-colors hover:text-pearl"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-pearl/50 transition-colors group-hover:text-pearl" strokeWidth={1.5} />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-rose/15 bg-pink-soft/50 py-6">
        <div className="container-premium">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-charcoal/75">
            For any doubts, please contact us via{" "}
            <strong className="font-medium text-charcoal">WhatsApp message only</strong>. Kindly note:
            calls will not be answered. You will get a reply within 24 hours. For support, email{" "}
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="font-medium text-maroon transition-colors hover:text-maroon-deep"
            >
              {CONTACT.supportEmail}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="container-premium py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone">Find us</p>
            <h2 className="mt-3 font-display text-2xl text-charcoal sm:text-3xl">Visit {SITE_NAME}</h2>
            <p className="mt-4 text-body">{CONTACT.addressShort}</p>
            <a
              href={CONTACT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-maroon transition-colors hover:text-maroon-deep"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>

          <StoreMap />
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-body">
          For a specific piece, use <strong className="font-medium text-charcoal">Express your interest</strong> on
          the product page — or{" "}
          <Link href={ROUTES.customStitching("appointment")} className="text-maroon hover:underline">
            book a stitching appointment
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
