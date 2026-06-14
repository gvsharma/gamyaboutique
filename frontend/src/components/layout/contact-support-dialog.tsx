"use client";

import { createContext, useCallback, useContext, useEffect, useId, useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT, whatsappHref } from "@/constants/site";

const SESSION_KEY = "gamya_support_notice_shown";

type SupportDialogContextValue = {
  open: () => void;
  close: () => void;
};

const SupportDialogContext = createContext<SupportDialogContextValue | null>(null);

export function useSupportDialog() {
  const ctx = useContext(SupportDialogContext);
  if (!ctx) {
    throw new Error("useSupportDialog must be used within SupportDialogProvider");
  }
  return ctx;
}

function ContactSupportDialogPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]"
        aria-label="Close support dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-xl border border-rose/25 bg-pearl p-6 shadow-elevated sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-charcoal/50 transition-colors hover:bg-warm hover:text-maroon"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-maroon/70">
          Contact &amp; support
        </p>
        <h2 id={titleId} className="mt-3 pr-8 font-display text-xl text-charcoal sm:text-2xl">
          We&apos;re here to help
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/75">
          For any doubts, please contact us (
          <strong className="font-medium text-charcoal">WhatsApp message only</strong>. Kindly note:
          Calls will not be answered. You will get a reply message within 24 hrs).
        </p>

        <div className="mt-6 space-y-3">
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            Message on WhatsApp
          </a>
          <div className="rounded-xl border border-charcoal/8 bg-warm/60 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone">For support</p>
            <a
              href={`mailto:${CONTACT.supportEmail}`}
              className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-maroon transition-colors hover:text-maroon-deep"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              {CONTACT.supportEmail}
            </a>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="mt-6 w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </div>
  );
}

export function SupportDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(true);
  }, []);

  return (
    <SupportDialogContext.Provider value={{ open: openDialog, close: closeDialog }}>
      {children}
      <ContactSupportDialogPanel open={open} onClose={closeDialog} />
    </SupportDialogContext.Provider>
  );
}

export function SupportDialogLink({
  className,
  children = "Contact & support",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { open } = useSupportDialog();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
