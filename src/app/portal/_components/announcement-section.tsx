"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CalendarX } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementCard } from "@/components/content/cards";
import { ContentGrid } from "@/components/content/content-grid";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import { fetchAnnouncements } from "@/lib/content/queries";
import { queryKeys } from "@/lib/query-keys";

const PAGE_SIZE = 4;

export default function AnnouncementSection() {
  const supabase = useMemo(() => createClient(), []);
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const debounced = useDebouncedValue(search);
  const params = { page, pageSize: PAGE_SIZE, search: debounced, when };

  const query = useQuery({
    queryKey: queryKeys.announcements.list(params),
    queryFn: () => fetchAnnouncements(supabase, params),
    placeholderData: keepPreviousData,
  });

  return (
    <ContentGrid
      id="announcements"
      title="Announcements and events"
      description="Workshops, talks and programs from the guidance office."
      filters={
        <Tabs
          value={when}
          onValueChange={(value) => {
            setWhen(value as "upcoming" | "past");
            setPage(0);
          }}
        >
          <TabsList aria-label="Show">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      search={search}
      onSearchChange={setSearch}
      searchLabel="Search announcements"
      items={query.data?.data ?? []}
      isLoading={query.isLoading}
      total={query.data?.count ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      onPageChange={setPage}
      itemLabel="events"
      empty={{
        title:
          when === "upcoming"
            ? "Nothing scheduled right now"
            : "No past events",
        description: "Check back soon.",
        icon: CalendarX,
      }}
      renderItem={(item) => (
        <AnnouncementCard key={item.id} announcement={item} />
      )}
    />
  );
}
