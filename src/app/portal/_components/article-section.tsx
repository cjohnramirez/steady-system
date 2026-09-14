"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { ArticleCard } from "@/components/content/cards";
import { ContentGrid } from "@/components/content/content-grid";
import { ExternalLinkDialog } from "@/components/content/external-link-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { fetchArticles } from "@/lib/content/queries";
import { queryKeys } from "@/lib/query-keys";
import { ALL_MOODS, MoodFilter } from "./mood-filter";

const PAGE_SIZE = 8;

export default function ArticleSection({
  defaultMoodId,
}: {
  defaultMoodId?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [mood, setMood] = useState(defaultMoodId ?? ALL_MOODS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [opening, setOpening] = useState<Tables<"article"> | null>(null);
  const debounced = useDebouncedValue(search);
  const params = {
    page,
    pageSize: PAGE_SIZE,
    search: debounced,
    emotionalStatusId: mood === ALL_MOODS ? undefined : mood,
  };

  const query = useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: () => fetchArticles(supabase, params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <ContentGrid
        id="articles"
        title="Articles"
        description="Short reads chosen by the guidance office."
        filters={
          <MoodFilter
            label="Filter articles by mood"
            value={mood}
            onChange={(value) => {
              setMood(value);
              setPage(0);
            }}
          />
        }
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search articles"
        items={query.data?.data ?? []}
        isLoading={query.isLoading}
        total={query.data?.count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="articles"
        empty={{
          title: "No articles for this mood yet",
          description: 'Try "Any mood" to see everything.',
          icon: BookOpen,
        }}
        renderItem={(item) => (
          <ArticleCard
            key={item.id}
            article={item}
            onSelect={() => setOpening(item)}
            actionLabel={`Read ${item.title}`}
          />
        )}
      />
      {opening && (
        <ExternalLinkDialog
          url={opening.link}
          title={opening.title}
          onClose={() => setOpening(null)}
        />
      )}
    </>
  );
}
