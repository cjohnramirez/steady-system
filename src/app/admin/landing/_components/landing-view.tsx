"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BookOpen, Megaphone, Music, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentGrid } from "@/components/content/content-grid";
import {
  AnnouncementCard,
  ArticleCard,
  PlaylistCard,
} from "@/components/content/cards";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import {
  fetchAnnouncements,
  fetchArticles,
  fetchPlaylists,
} from "@/lib/content/queries";
import { queryKeys } from "@/lib/query-keys";
import AnnouncementDialog from "./announcement-dialog";
import ArticleDialog from "./article-dialog";
import PlaylistDialog from "./playlist-dialog";

const PAGE_SIZE = 8;

function useList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const debounced = useDebouncedValue(search);
  return {
    search,
    setSearch,
    page,
    setPage,
    params: { page, pageSize: PAGE_SIZE, search: debounced },
  };
}

export default function LandingView() {
  return (
    <Tabs defaultValue="announcements" className="gap-6">
      <TabsList>
        <TabsTrigger value="announcements">
          <Megaphone aria-hidden /> Announcements
        </TabsTrigger>
        <TabsTrigger value="articles">
          <BookOpen aria-hidden /> Articles
        </TabsTrigger>
        <TabsTrigger value="playlists">
          <Music aria-hidden /> Playlists
        </TabsTrigger>
      </TabsList>
      <TabsContent value="announcements">
        <AnnouncementManager />
      </TabsContent>
      <TabsContent value="articles">
        <ArticleManager />
      </TabsContent>
      <TabsContent value="playlists">
        <PlaylistManager />
      </TabsContent>
    </Tabs>
  );
}

function AnnouncementManager() {
  const supabase = useMemo(() => createClient(), []);
  const list = useList();
  const [editing, setEditing] = useState<Tables<"announcement"> | "new" | null>(
    null,
  );
  const query = useQuery({
    queryKey: queryKeys.announcements.list({ ...list.params, admin: true }),
    queryFn: () => fetchAnnouncements(supabase, list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <ContentGrid
        title="Announcements"
        description="Newest first, including past events."
        actions={
          <AddButton
            label="New announcement"
            onClick={() => setEditing("new")}
          />
        }
        search={list.search}
        onSearchChange={list.setSearch}
        searchLabel="Search announcements"
        items={query.data?.data ?? []}
        isLoading={query.isLoading}
        total={query.data?.count ?? 0}
        page={list.page}
        pageSize={PAGE_SIZE}
        onPageChange={list.setPage}
        itemLabel="announcements"
        empty={{ title: "No announcements yet", icon: Megaphone }}
        renderItem={(item) => (
          <AnnouncementCard
            key={item.id}
            announcement={item}
            onSelect={() => setEditing(item)}
            actionLabel={`Edit ${item.title}`}
          />
        )}
      />
      {editing && (
        <AnnouncementDialog
          announcement={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ArticleManager() {
  const supabase = useMemo(() => createClient(), []);
  const list = useList();
  const [editing, setEditing] = useState<Tables<"article"> | "new" | null>(
    null,
  );
  const query = useQuery({
    queryKey: queryKeys.articles.list(list.params),
    queryFn: () => fetchArticles(supabase, list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <ContentGrid
        title="Articles"
        description="Recently added first."
        actions={
          <AddButton label="New article" onClick={() => setEditing("new")} />
        }
        search={list.search}
        onSearchChange={list.setSearch}
        searchLabel="Search articles"
        items={query.data?.data ?? []}
        isLoading={query.isLoading}
        total={query.data?.count ?? 0}
        page={list.page}
        pageSize={PAGE_SIZE}
        onPageChange={list.setPage}
        itemLabel="articles"
        empty={{ title: "No articles yet", icon: BookOpen }}
        renderItem={(item) => (
          <ArticleCard
            key={item.id}
            article={item}
            onSelect={() => setEditing(item)}
            actionLabel={`Edit ${item.title}`}
          />
        )}
      />
      {editing && (
        <ArticleDialog
          article={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function PlaylistManager() {
  const supabase = useMemo(() => createClient(), []);
  const list = useList();
  const [editing, setEditing] = useState<
    Tables<"playlist_with_details"> | "new" | null
  >(null);
  const query = useQuery({
    queryKey: queryKeys.playlists.list(list.params),
    queryFn: () => fetchPlaylists(supabase, list.params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <ContentGrid
        title="Playlists"
        description="Alphabetical."
        actions={
          <AddButton label="New playlist" onClick={() => setEditing("new")} />
        }
        search={list.search}
        onSearchChange={list.setSearch}
        searchLabel="Search playlists"
        items={query.data?.data ?? []}
        isLoading={query.isLoading}
        total={query.data?.count ?? 0}
        page={list.page}
        pageSize={PAGE_SIZE}
        onPageChange={list.setPage}
        itemLabel="playlists"
        empty={{ title: "No playlists yet", icon: Music }}
        renderItem={(item) => (
          <PlaylistCard
            key={item.id}
            playlist={item}
            onSelect={() => setEditing(item)}
            actionLabel={`Edit ${item.title}`}
          />
        )}
      />
      {editing && (
        <PlaylistDialog
          playlist={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Plus aria-hidden />
      {label}
    </Button>
  );
}
