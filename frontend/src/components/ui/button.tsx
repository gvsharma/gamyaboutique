import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "soft";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-charcoal text-pearl hover:bg-maroon shadow-soft active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-mustard text-charcoal hover:bg-gold shadow-soft active:scale-[0.98] disabled:opacity-50",
  soft: "bg-blush/50 text-maroon hover:bg-blush active:scale-[0.98] disabled:opacity-50",
  ghost: "text-charcoal hover:bg-ivory disabled:opacity-50",
  outline:
    "border border-charcoal/20 text-charcoal hover:border-charcoal/40 hover:bg-warm disabled:opacity-50",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-xs tracking-wide",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-sm tracking-wide",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-premium",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
