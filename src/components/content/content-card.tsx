"use client";

import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TileImage } from "./tile-image";

export type ContentMeta = { icon: LucideIcon; label: string };

/**
 * The tile used for articles, announcements and playlists, on the portal and in
 * the admin CMS alike.
 *
 * There were six tile components (three per area) that disagreed on borders,
 * radius and image sizing, rendered `<div onClick>` so they could not be reached by
 * keyboard, and requested full-viewport images for quarter-width tiles.
 */
export function ContentCard({
  image,
  eyebrow,
  title,
  description,
  meta = [],
  onSelect,
  actionLabel,
  className,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string | null;
  meta?: ContentMeta[];
  onSelect?: () => void;
  /** Screen-reader name for the whole card, e.g. "Edit Wellness Week". */
  actionLabel?: string;
  className?: string;
}) {
  const body = (
    <>
      <div className="bg-muted relative aspect-[16/10] overflow-hidden rounded-xl">
        <TileImage
          src={image}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-[opacity,transform] group-hover:scale-[1.02]"
        />
        {eyebrow && (
          <span className="bg-card/95 absolute top-3 left-3 rounded-full border px-2.5 py-0.5 text-xs">
            {eyebrow}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-1 pt-3 pb-1 text-left">
        <h3 className="line-clamp-2 font-medium">{title}</h3>
        {description && (
          <p className="text-muted-foreground line-clamp-2">{description}</p>
        )}
        {meta.length > 0 && (
          <ul className="text-muted-foreground mt-auto flex flex-col gap-1 pt-2 text-xs">
            {meta.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon
                  aria-hidden
                  strokeWidth={1.5}
                  className="size-3.5 shrink-0"
                />
                <span className="truncate">{label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  const classes = cn(
    "group bg-card flex h-full flex-col rounded-2xl border p-2 transition-colors",
    onSelect &&
      "hover:bg-muted/40 focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-[3px]",
    className,
  );

  return onSelect ? (
    <button
      type="button"
      onClick={onSelect}
      className={classes}
      aria-label={actionLabel}
    >
      {body}
    </button>
  ) : (
    <article className={classes}>{body}</article>
  );
}

export function ContentCardSkeleton() {
  return (
    <div
      className="bg-card flex flex-col gap-3 rounded-2xl border p-2"
      aria-hidden
    >
      <Skeleton className="aspect-[16/10] rounded-xl" />
      <div className="space-y-2 px-1 pb-2">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
