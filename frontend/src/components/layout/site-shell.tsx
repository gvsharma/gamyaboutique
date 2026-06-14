import { BoutiqueDecor } from "@/components/layout/boutique-decor";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-cream">
      <BoutiqueDecor />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
