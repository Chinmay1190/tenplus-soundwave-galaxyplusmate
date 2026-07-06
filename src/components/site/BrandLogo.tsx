import { useMemo, useRef, useState } from "react";
import { brandLogoSources } from "@/lib/brand-logo";

/**
 * Renders a brand mark with a resilient fallback chain so every brand
 * ALWAYS shows something recognizable (or at minimum a letter avatar).
 * Pass an explicit `url` to bypass the chain with a custom logo.
 */
export function BrandLogo({
  brand,
  alt,
  className,
  url,
  size = 128,
}: {
  brand: string;
  alt?: string;
  className?: string;
  url?: string;
  size?: number;
}) {
  const sources = useMemo(() => {
    const chain = brandLogoSources(brand, size);
    return url ? [url, ...chain] : chain;
  }, [brand, size, url]);
  const idxRef = useRef(0);
  const [src, setSrc] = useState(sources[0]);
  return (
    <img
      src={src}
      alt={alt ?? `${brand} logo`}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        idxRef.current += 1;
        if (idxRef.current < sources.length) setSrc(sources[idxRef.current]);
      }}
    />
  );
}
