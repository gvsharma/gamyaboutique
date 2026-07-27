"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { ProductColor } from "@/types/product";

interface ColorPickerProps {
  value: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

const PRESET_COLORS = [
  { name: "Maroon", hex: "#722F37" },
  { name: "Gold", hex: "#C5A572" },
  { name: "Ivory", hex: "#F5F0E8" },
  { name: "Emerald", hex: "#046307" },
  { name: "Navy", hex: "#1B2A4A" },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#722F37");

  const addColor = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (value.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, { name: trimmed, hex: hex || undefined }]);
    setName("");
  };

  const removeColor = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((color, index) => (
            <span
              key={`${color.name}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-pearl px-3 py-1.5 text-sm"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-charcoal/10"
                style={{ backgroundColor: color.hex ?? "#ccc" }}
              />
              {color.name}
              <button
                type="button"
                onClick={() => removeColor(index)}
                className="text-stone hover:text-maroon"
                aria-label={`Remove ${color.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.filter((p) => !value.some((v) => v.name === p.name)).map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onChange([...value, preset])}
            className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/10 px-2.5 py-1 text-xs text-stone hover:border-maroon/30"
          >
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.hex }} />
            + {preset.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[8rem] flex-1">
          <label className="text-eyebrow text-stone">Color name</label>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maroon"
          />
        </div>
        <div>
          <label className="text-eyebrow text-stone">Swatch</label>
          <input
            className="admin-input !w-16 !px-2"
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={addColor}
          className="inline-flex items-center gap-1 rounded-xl border border-charcoal/12 px-3 py-2 text-sm text-maroon hover:bg-ivory/60"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </div>
  );
}
