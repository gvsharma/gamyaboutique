"use client";

import { PRODUCT_SIZES } from "@/components/product/size-chart-modal";
import { cn } from "@/lib/utils";

interface SizePickerProps {
  value: string[];
  onChange: (sizes: string[]) => void;
}

export function SizePicker({ value, onChange }: SizePickerProps) {
  const toggle = (size: string) => {
    if (value.includes(size)) {
      onChange(value.filter((s) => s !== size));
    } else {
      onChange([...value, size]);
    }
  };

  const selectAll = () => onChange([...PRODUCT_SIZES]);
  const clearAll = () => onChange([]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRODUCT_SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggle(size)}
            className={cn(
              "min-w-[3rem] rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              value.includes(size)
                ? "border-maroon bg-maroon text-pearl"
                : "border-charcoal/12 bg-pearl text-charcoal hover:border-maroon/30",
            )}
            aria-pressed={value.includes(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <button type="button" className="text-maroon underline-offset-2 hover:underline" onClick={selectAll}>
          Select all
        </button>
        <span className="text-stone/40">·</span>
        <button type="button" className="text-stone underline-offset-2 hover:underline" onClick={clearAll}>
          Clear
        </button>
      </div>
      <p className="text-xs text-stone">
        Leave empty to show all standard sizes on the storefront.
      </p>
    </div>
  );
}
