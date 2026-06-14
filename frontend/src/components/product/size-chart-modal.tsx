"use client";

import { useEffect, useId } from "react";
import { Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIZE_ROWS = [
  { size: "XS", bust: "32", waist: "26", hip: "34", length: "38" },
  { size: "S", bust: "34", waist: "28", hip: "36", length: "39" },
  { size: "M", bust: "36", waist: "30", hip: "38", length: "40" },
  { size: "L", bust: "38", waist: "32", hip: "40", length: "41" },
  { size: "XL", bust: "40", waist: "34", hip: "42", length: "42" },
  { size: "XXL", bust: "42", waist: "36", hip: "44", length: "43" },
] as const;

interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
}

export function SizeChartModal({ open, onClose, productName }: SizeChartModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px]"
        aria-label="Close size chart"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-rose/20 bg-pearl shadow-elevated sm:max-w-lg sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-charcoal/5 bg-pearl/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-maroon/70">
              <Ruler className="h-3.5 w-3.5" />
              Size guide
            </p>
            <h2 id={titleId} className="mt-1 font-display text-xl text-charcoal">
              Women &amp; girls ethnic wear
            </h2>
            {productName && (
              <p className="mt-1 text-xs text-stone">{productName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-charcoal/50 transition-colors hover:bg-warm hover:text-maroon"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-stone">
            All measurements are in inches. For the best fit, measure your bust, waist, and hip at
            the fullest points. Custom tailoring is available — contact us for bespoke sizing.
          </p>

          <div className="mt-5 overflow-x-auto rounded-xl border border-charcoal/8">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/8 bg-warm/70">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
                    Size
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
                    Bust
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
                    Waist
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
                    Hip
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map((row, i) => (
                  <tr
                    key={row.size}
                    className={i % 2 === 0 ? "bg-pearl" : "bg-ivory/40"}
                  >
                    <td className="px-4 py-2.5 font-medium text-maroon">{row.size}</td>
                    <td className="px-4 py-2.5 text-charcoal">{row.bust}&quot;</td>
                    <td className="px-4 py-2.5 text-charcoal">{row.waist}&quot;</td>
                    <td className="px-4 py-2.5 text-charcoal">{row.hip}&quot;</td>
                    <td className="px-4 py-2.5 text-charcoal">{row.length}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-stone/80">
            Sizes may vary slightly by style. If you are between sizes, we recommend choosing the
            larger size or reaching out for a consultation.
          </p>

          <Button variant="ghost" size="sm" className="mt-5 w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export const PRODUCT_SIZES = SIZE_ROWS.map((r) => r.size);
