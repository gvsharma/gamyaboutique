import Image from "next/image";
import { cn } from "@/lib/utils";

interface CoverHeroImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  /** Taller hero for editorial pages; category uses a wide banner. */
  variant?: "banner" | "editorial";
  className?: string;
}

/**
 * Cover image that shows the full photo without cropping (letterboxed on linen).
 */
export function CoverHeroImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  variant = "banner",
  className,
}: CoverHeroImageProps) {
  const frameClass =
    variant === "editorial"
      ? "aspect-[4/5] max-h-[min(78vh,44rem)] sm:aspect-[5/4]"
      : "aspect-[16/10] max-h-[min(52vh,28rem)] sm:aspect-[16/9] sm:max-h-[32rem]";

  return (
    <div className={cn("relative w-full overflow-hidden bg-linen", className)}>
      <div className={cn("relative mx-auto w-full", frameClass)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
