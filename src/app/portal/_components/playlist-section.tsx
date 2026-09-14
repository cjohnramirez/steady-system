"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { PlaylistCard } from "@/components/content/cards";
import { ContentGrid } from "@/components/content/content-grid";
import { ExternalLinkDialog } from "@/components/content/external-link-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { fetchPlaylists } from "@/lib/content/queries";
import { queryKeys } from "@/lib/query-keys";
import { ALL_MOODS, MoodFilter } from "./mood-filter";

const PAGE_SIZE = 8;

/** Playlist tiles showed an "open" arrow but could not be opened. */
export default function PlaylistSection({
  defaultMoodId,
}: {
  defaultMoodId?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [mood, setMood] = useState(defaultMoodId ?? ALL_MOODS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [opening, setOpening] =
    useState<Tables<"playlist_with_details"> | null>(null);
  const debounced = useDebouncedValue(search);
  const params = {
    page,
    pageSize: PAGE_SIZE,
    search: debounced,
    emotionalStatusId: mood === ALL_MOODS ? undefined : mood,
  };

  const query = useQuery({
    queryKey: queryKeys.playlists.list(params),
    queryFn: () => fetchPlaylists(supabase, params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <ContentGrid
        id="playlists"
        title="Playlists"
        description="Music for studying, winding down or lifting your mood."
        filters={
          <MoodFilter
            label="Filter playlists by mood"
            value={mood}
            onChange={(value) => {
              setMood(value);
              setPage(0);
            }}
          />
        }
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search playlists"
        items={query.data?.data ?? []}
        isLoading={query.isLoading}
        total={query.data?.count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="playlists"
        empty={{
          title: "No playlists for this mood yet",
          description: 'Try "Any mood".',
          icon: Music,
        }}
        renderItem={(item) => (
          <PlaylistCard
            key={item.id}
            playlist={item}
            onSelect={() => setOpening(item)}
            actionLabel={`Open ${item.title}`}
          />
        )}
      />
      {opening?.link && (
        <ExternalLinkDialog
          url={opening.link}
          title={opening.title ?? "playlist"}
          onClose={() => setOpening(null)}
        />
      )}
    </>
  );
}
