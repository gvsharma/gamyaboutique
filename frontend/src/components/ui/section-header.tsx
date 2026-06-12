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
      {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-section-title text-charcoal">{title}</h2>
      {description && (
        <p className={cn("mt-3 max-w-2xl text-body", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
