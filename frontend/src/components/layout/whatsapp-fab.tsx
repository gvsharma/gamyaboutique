import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/constants/site";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-4 z-40 flex items-center gap-2 lg:bottom-8 lg:right-6"
      aria-label="Chat on WhatsApp for enquiries and orders"
    >
      <span className="hidden rounded-full border border-charcoal/5 bg-pearl/95 px-3 py-1.5 text-xs font-medium text-charcoal shadow-soft backdrop-blur-sm transition-all duration-300 group-hover:border-maroon/20 group-hover:text-maroon sm:inline">
        Enquire on WhatsApp
      </span>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevated transition-transform duration-300 ease-premium group-hover:scale-105 group-active:scale-95">
        <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
      </span>
    </a>
  );
}
