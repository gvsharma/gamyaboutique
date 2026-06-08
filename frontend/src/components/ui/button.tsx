import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-burgundy text-cream hover:bg-burgundy-dark shadow-sm disabled:opacity-50",
  secondary: "bg-gold text-charcoal hover:bg-gold-muted disabled:opacity-50",
  ghost: "text-charcoal hover:bg-ivory disabled:opacity-50",
  outline:
    "border border-burgundy/30 text-burgundy hover:bg-burgundy/5 disabled:opacity-50",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-xs tracking-wide uppercase",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-sm tracking-wide uppercase",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
