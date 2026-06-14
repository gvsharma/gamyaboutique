"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-stone">Qty</span>
      <div className="inline-flex items-center rounded-full border border-charcoal/10 bg-pearl">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-l-full text-charcoal transition-colors hover:bg-warm disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span
          className="min-w-[2.5rem] text-center text-sm font-medium tabular-nums text-charcoal"
          aria-live="polite"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-r-full text-charcoal transition-colors hover:bg-warm disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
