"use client";

import { CalendarDays, MapPin, Music, PenLine, Smile } from "lucide-react";
import type { Tables } from "@/types/supabase";
import { formatEventRange, strToTitleCase } from "@/lib/format";
import { ContentCard } from "./content-card";

function eventStatus(start: string, end: string) {
  const now = Date.now();
  if (new Date(end).getTime() < now) return "Past";
  if (new Date(start).getTime() <= now) return "Happening now";
  return "Upcoming";
}

export function AnnouncementCard({
  announcement,
  onSelect,
  actionLabel,
}: {
  announcement: Tables<"announcement">;
  onSelect?: () => void;
  actionLabel?: string;
}) {
  return (
    <ContentCard
      image={announcement.announcement_image}
      eyebrow={eventStatus(announcement.start_date, announcement.end_date)}
      title={announcement.title}
      description={announcement.description}
      meta={[
        {
          icon: CalendarDays,
          label: formatEventRange(
            announcement.start_date,
            announcement.end_date,
          ),
        },
        { icon: MapPin, label: announcement.location },
      ]}
      onSelect={onSelect}
      actionLabel={actionLabel}
    />
  );
}

export function ArticleCard({
  article,
  onSelect,
  actionLabel,
}: {
  article: Tables<"article">;
  onSelect?: () => void;
  actionLabel?: string;
}) {
  return (
    <ContentCard
      image={article.article_image}
      eyebrow={article.publisher_name || undefined}
      title={article.title}
      description={article.content}
      meta={[{ icon: PenLine, label: article.author_name || "Unknown author" }]}
      onSelect={onSelect}
      actionLabel={actionLabel}
    />
  );
}

export function PlaylistCard({
  playlist,
  onSelect,
  actionLabel,
}: {
  playlist: Tables<"playlist_with_details">;
  onSelect?: () => void;
  actionLabel?: string;
}) {
  return (
    <ContentCard
      image={playlist.image ?? ""}
      eyebrow={
        playlist.emotional_status_name
          ? strToTitleCase(playlist.emotional_status_name)
          : undefined
      }
      title={playlist.title ?? ""}
      meta={[
        { icon: Music, label: playlist.creator || "GCS" },
        ...(playlist.emotional_status_name
          ? [
              {
                icon: Smile,
                label: `For feeling ${playlist.emotional_status_name}`,
              },
            ]
          : []),
      ]}
      onSelect={onSelect}
      actionLabel={actionLabel}
    />
  );
}
