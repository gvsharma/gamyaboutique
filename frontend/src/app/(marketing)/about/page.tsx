import { SITE_NAME } from "@/constants/site";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.25em] text-gold-muted">Our story</p>
      <h1 className="mt-2 font-display text-4xl text-burgundy">About {SITE_NAME}</h1>
      <div className="mt-8 space-y-6 text-stone leading-relaxed">
        <p>
          Gamya Couture celebrates the artistry of Indian ethnic wear — from heirloom Banarasi
          weaves to contemporary silhouettes crafted for modern celebrations.
        </p>
        <p>
          Every piece in our collection is selected for fabric quality, drape, and finish. We work
          closely with master weavers and karigars across India to bring you sarees, lehengas, and
          occasion wear that feel as exceptional as they look.
        </p>
        <p>
          Whether you are preparing for a wedding, festival, or an intimate gathering, our stylists
          offer personalized guidance — because luxury is in the details.
        </p>
      </div>
    </div>
  );
}
