"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type CatalogImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc: string;
};

/** Next/Image with automatic fallback when remote product/category URLs 404. */
export function CatalogImage({ src, fallbackSrc, alt, ...props }: CatalogImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
