import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/constants/routes";
import { CONTACT, SITE_NAME, whatsappHref } from "@/constants/site";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container-premium py-16 sm:py-20 lg:py-24">
      <SectionHeader
        align="left"
        eyebrow="Legal"
        title="Privacy Policy"
        className="mb-4"
      />
      <p className="mb-12 text-sm text-stone">Last updated on Jun 7th 2024</p>

      <div className="mx-auto max-w-3xl space-y-10 text-body">
        <section className="space-y-4">
          <p>
            This privacy policy sets out how {SITE_NAME} uses and protects any information that you
            give {SITE_NAME} when you visit their website and/or agree to purchase from them.
          </p>
          <p>
            {SITE_NAME} is committed to ensuring that your privacy is protected. Should we ask you to
            provide certain information by which you can be identified when using this website, then
            you can be assured that it will only be used in accordance with this privacy statement.
          </p>
          <p>
            {SITE_NAME} may change this policy from time to time by updating this page. You should
            check this page from time to time to ensure that you adhere to these changes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-charcoal">Information we collect</h2>
          <p className="mt-4">We may collect the following information:</p>
          <ul className="mt-4 space-y-2">
            {["Name", "Contact information including email address", "Demographic information such as postcode, preferences and interests, if required", "Other information relevant to customer surveys and/or offers"].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-charcoal">
            What we do with the information we gather
          </h2>
          <p className="mt-4">
            We require this information to understand your needs and provide you with a better
            service, and in particular for the following reasons:
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Internal record keeping.",
              "We may use the information to improve our products and services.",
              "We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.",
              "From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-charcoal">Security</h2>
          <p className="mt-4">
            We are committed to ensuring that your information is secure. In order to prevent
            unauthorised access or disclosure we have put in suitable measures.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-charcoal">How we use cookies</h2>
          <div className="mt-4 space-y-4">
            <p>
              A cookie is a small file which asks permission to be placed on your computer&apos;s hard
              drive. Once you agree, the file is added and the cookie helps analyze web traffic or
              lets you know when you visit a particular site. Cookies allow web applications to respond
              to you as an individual. The web application can tailor its operations to your needs,
              likes and dislikes by gathering and remembering information about your preferences.
            </p>
            <p>
              We use traffic log cookies to identify which pages are being used. This helps us
              analyze data about webpage traffic and improve our website in order to tailor it to
              customer needs. We only use this information for statistical analysis purposes and then
              the data is removed from the system.
            </p>
            <p>
              Overall, cookies help us provide you with a better website, by enabling us to monitor
              which pages you find useful and which you do not. A cookie in no way gives us access to
              your computer or any information about you, other than the data you choose to share with
              us.
            </p>
            <p>
              You can choose to accept or decline cookies. Most web browsers automatically accept
              cookies, but you can usually modify your browser setting to decline cookies if you
              prefer. This may prevent you from taking full advantage of the website.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-charcoal">Controlling your personal information</h2>
          <div className="mt-4 space-y-4">
            <p>
              You may choose to restrict the collection or use of your personal information in the
              following ways:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                <span>
                  whenever you are asked to fill in a form on the website, look for the box that you
                  can click to indicate that you do not want the information to be used by anybody for
                  direct marketing purposes
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" aria-hidden />
                <span>
                  if you have previously agreed to us using your personal information for direct
                  marketing purposes, you may change your mind at any time by writing to or emailing
                  us at{" "}
                  <a
                    href={`mailto:${CONTACT.supportEmail}`}
                    className="font-medium text-maroon hover:underline"
                  >
                    {CONTACT.supportEmail}
                  </a>
                </span>
              </li>
            </ul>
            <p>
              We will not sell, distribute or lease your personal information to third parties unless
              we have your permission or are required by law to do so. We may use your personal
              information to send you promotional information about third parties which we think you
              may find interesting if you tell us that you wish this to happen.
            </p>
          </div>
        </section>

        <section className="surface-muted px-6 py-6 sm:px-8">
          <h2 className="font-display text-2xl text-charcoal">Refund policy</h2>
          <div className="mt-4 space-y-4">
            <p>
              Slight color differences due to photography resolution is not acceptable for exchange.
              We always gives best quality and best price. so no returns accepted. In case of damage,
              exchange accepted only with proper open video proof without cut or pause. It is
              compulsory for attending incase any complaints.
            </p>
            <p>
              You have to return the parcel within 4 days once received incase if exchange accepted..
              whereas shipping charge 60 to 100 will be given from our side.
            </p>
            <p>Once refund initiated you will receive the amount within 5 to 7 working days.</p>
          </div>
        </section>

        <section className="surface-muted px-6 py-6 sm:px-8">
          <h2 className="font-display text-2xl text-charcoal">Shipping policy</h2>

          <h3 className="mt-6 font-display text-lg text-charcoal">Within India</h3>
          <div className="mt-4 space-y-4">
            <p>No cod. Only online payment. Shipping is extra unless if mentioned as free shipping</p>
            <p>
              Generally we will dispatch the Saree within 3 to 7 working days, Kindly wait for transit
              time. For dyable sarees like warm silk, viscose georgette, customised sarees, dispatch
              takes two more days extra to complete polishing. If it is not delivered within 8 days,
              please inform us, we will send you tracking information. Maximum you will receive the
              product in 7 to 15 working days
            </p>
            <p>
              If any delay in courier happens. Please give us sometime to solve the issue by raising
              complaint. Don&apos;t claim immediate refund.
            </p>
            <p className="text-sm italic text-stone">
              Please note: During festival seasons such as Diwali, Pongal, Ramzan, and Bakrid,
              manufacturing operations will be temporarily paused due to worker holidays. We kindly
              request that you refrain from placing urgent or committed orders during this time.
              Additionally, please expect a one-week delay in delivery for orders placed during the
              festival period.
            </p>
          </div>

          <h3 className="mt-8 font-display text-lg text-charcoal">For overseas customers</h3>
          <p className="mt-4">
            Please do whatsapp to{" "}
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-maroon transition-colors hover:text-maroon-deep"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              {CONTACT.phoneDisplay}
            </a>{" "}
            before placing your order for shipping details and availability.
          </p>
        </section>

        <p className="text-sm text-stone">
          Questions?{" "}
          <Link href={ROUTES.contact} className="font-medium text-maroon hover:underline">
            Contact us
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${CONTACT.supportEmail}`} className="font-medium text-maroon hover:underline">
            {CONTACT.supportEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
