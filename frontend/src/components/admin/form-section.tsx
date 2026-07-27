"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function FormSection({ title, description, defaultOpen = true, children }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-charcoal/8 bg-ivory/30">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <p className="font-medium text-charcoal">{title}</p>
          {description && <p className="mt-0.5 text-xs text-stone">{description}</p>}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-stone transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4 border-t border-charcoal/8 px-5 py-5">{children}</div>}
    </section>
  );
}
