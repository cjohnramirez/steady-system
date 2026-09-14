import Link from "next/link";
import { ArrowUpRight, Compass, type LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/app/icon-badge";
import { TileImage } from "@/components/content/tile-image";
import { cn } from "@/lib/utils";

type PhotoTile = {
  kind: "photo";
  key: string;
  href: string;
  label: string;
  title: string;
  meta?: string | null;
  image: string;
  className: string;
  sizes: string;
};

type LinkTile = {
  kind: "link";
  key: string;
  href: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  className: string;
};

export type AboutMosaicContent = {
  article: { title: string; author_name: string; article_image: string } | null;
  activity: {
    title: string;
    location: string;
    announcement_image: string;
  } | null;
  playlist: { title: string; creator: string; image: string } | null;
};

/**
 * A bento of four tiles under "Who we are": the latest article (large), a recent
 * activity, a playlist and a plain link tile.
 *
 * It used to show three articles in a three-column grid. The first spanned two
 * columns, so the third wrapped onto a row of its own and left two blank columns,
 * and three articles in a row all carried the same kind of photo. Drawing from
 * three content types gives the photos variety, and the plain tile breaks up the
 * wall of images the way the original design did.
 */
export function AboutMosaic({
  article,
  activity,
  playlist,
}: AboutMosaicContent) {
  const tiles: (PhotoTile | LinkTile)[] = [];

  if (article) {
    tiles.push({
      kind: "photo",
      key: "article",
      href: "/portal#articles",
      label: "Recommended reading",
      title: article.title,
      meta: article.author_name ? `by ${article.author_name}` : null,
      image: article.article_image,
      className: "md:col-span-2 lg:row-span-2",
      sizes: "(min-width: 1024px) 50vw, 100vw",
    });
  }
  if (activity) {
    tiles.push({
      kind: "photo",
      key: "activity",
      href: "/portal#announcements",
      label: "Recent activity",
      title: activity.title,
      meta: activity.location,
      image: activity.announcement_image,
      className: "md:col-span-2",
      sizes: "(min-width: 1024px) 50vw, 100vw",
    });
  }
  if (playlist) {
    tiles.push({
      kind: "photo",
      key: "playlist",
      href: "/portal#playlists",
      label: "Playlist",
      title: playlist.title,
      meta: playlist.creator,
      image: playlist.image,
      className: "",
      sizes: "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw",
    });
  }
  tiles.push({
    kind: "link",
    key: "portal",
    href: "/portal",
    icon: Compass,
    title: "Explore the portal",
    meta: "Articles, events and music picked for how you feel.",
    // Without a playlist it takes both columns, so the row has no gap.
    className: playlist ? "" : "md:col-span-2",
  });

  return (
    <div className="grid auto-rows-[16rem] gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) =>
        tile.kind === "photo" ? (
          <Link
            key={tile.key}
            href={tile.href}
            className={cn(
              "group bg-card focus-visible:ring-ring/50 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-3 outline-none focus-visible:ring-[3px]",
              tile.className,
            )}
          >
            <TileImage
              src={tile.image}
              sizes={tile.sizes}
              className="transition-[opacity,transform] group-hover:scale-[1.02]"
            />
            <span className="bg-card/95 relative w-fit rounded-full px-3 py-1 text-xs backdrop-blur">
              {tile.label}
            </span>
            <span className="bg-card/95 relative flex items-center gap-3 rounded-2xl p-4 backdrop-blur">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{tile.title}</span>
                {tile.meta && (
                  <span className="text-muted-foreground block truncate text-xs">
                    {tile.meta}
                  </span>
                )}
              </span>
              <ArrowUpRight
                aria-hidden
                strokeWidth={1.25}
                className="size-5 shrink-0"
              />
            </span>
          </Link>
        ) : (
          <Link
            key={tile.key}
            href={tile.href}
            className={cn(
              "group bg-card hover:bg-muted/40 focus-visible:ring-ring/50 flex flex-col justify-between rounded-3xl border p-6 transition-colors outline-none focus-visible:ring-[3px]",
              tile.className,
            )}
          >
            <span className="flex items-start justify-between">
              <IconBadge icon={tile.icon} />
              <ArrowUpRight
                aria-hidden
                strokeWidth={1.25}
                className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
            <span className="space-y-1">
              <span className="block font-medium">{tile.title}</span>
              <span className="text-muted-foreground block">{tile.meta}</span>
            </span>
          </Link>
        ),
      )}
    </div>
  );
}
