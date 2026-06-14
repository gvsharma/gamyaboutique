import { CONTACT } from "@/constants/site";
import { cn } from "@/lib/utils";

type StoreMapProps = {
  className?: string;
  title?: string;
};

export function StoreMap({ className, title = "Gamya Couture on Google Maps" }: StoreMapProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-charcoal/8 bg-pearl", className)}>
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
        <iframe
          src={CONTACT.mapsEmbedUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
