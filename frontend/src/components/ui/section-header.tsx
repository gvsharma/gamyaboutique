import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <div className={cn("flex items-center gap-4", align === "center" && "justify-center")}>
          {align === "left" && <span className="hidden h-px w-8 bg-charcoal/15 sm:block" />}
          <p className="text-eyebrow">{eyebrow}</p>
          {align === "center" && <span className="hidden h-px w-8 bg-charcoal/15 sm:block" />}
        </div>
      )}
      <h2 className="mt-3 font-display text-section-title text-charcoal">{title}</h2>
      {description && (
        <p className={cn("mt-4 max-w-2xl text-body", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
