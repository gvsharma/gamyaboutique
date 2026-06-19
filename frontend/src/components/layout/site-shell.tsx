import { BoutiqueDecor } from "@/components/layout/boutique-decor";
import { SupportDialogProvider } from "@/components/layout/contact-support-dialog";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { RecentlyViewedSection } from "@/components/product/recently-viewed-section";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <SupportDialogProvider>
      <div className="relative isolate flex min-h-screen flex-col bg-cream">
        <BoutiqueDecor />
        <Navbar />
        <main className="relative z-[2] flex-1">{children}</main>
        <RecentlyViewedSection />
        <Footer />
        <WhatsAppFab />
      </div>
    </SupportDialogProvider>
  );
}
