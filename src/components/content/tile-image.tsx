"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const FALLBACK = "/placeholder.png";

/**
 * A photo that fills its tile, with a pulsing placeholder until it has loaded.
 *
 * Tiles used to sit empty (a flat grey box, or the card colour) while their
 * Cloudinary photos downloaded, which on a slow connection looked like missing
 * images. The photo fades in once ready (instantly with reduced motion), and a
 * broken URL falls back to the placeholder image instead of a broken tile.
 *
 * The parent must be `relative` with a size, as for any `fill` image.
 */
export function TileImage({
  src,
  sizes,
  alt = "",
  priority,
  className,
}: {
  src: string | null | undefined;
  sizes: string;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      {!loaded && (
        <Skeleton aria-hidden className="absolute inset-0 rounded-none" />
      )}
      <Image
        src={failed || !src ? FALLBACK : src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (failed) setLoaded(true);
          else setFailed(true);
        }}
        className={cn(
          "object-cover transition-opacity duration-500 motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
