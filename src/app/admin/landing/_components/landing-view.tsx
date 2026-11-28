"use client";

import { useMemo, useState, useTransition } from "react";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Megaphone,
  Music,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { PillTabs } from "@/components/app/pill-tabs";
import { SteadyLabel } from "@/components/app/steady-label";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { deleteContent } from "@/lib/content/actions";
import {
  fetchAnnouncements,
  fetchArticles,
  fetchPlaylists,
} from "@/lib/content/queries";
import { queryKeys } from "@/lib/query-keys";
import AnnouncementDialog from "./announcement-dialog";
import ArticleDialog from "./article-dialog";
import PlaylistDialog from "./playlist-dialog";

type CmsTab = "articles" | "announcements" | "playlists";
type TimeFilter = "all" | "7" | "30";

const PAGE_SIZE = 6;

function isWithinDays(
  dateStr: string | null | undefined,
  days: number,
): boolean {
  if (!dateStr) return true;
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts <= days * 24 * 60 * 60 * 1000;
}

/**
 * Portal and Landing Page CMS (Figma 678:21004):
 * Unified card-grid CMS for Articles, Announcements and Events, and Playlists
 * with PillTabs, search + time filter, and direct Edit / Delete actions.
 */
export default function LandingView() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [tab, setTab] = useState<CmsTab>("articles");
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [page, setPage] = useState(0);
  const [isDeleting, startDelete] = useTransition();

  const [editingArticle, setEditingArticle] = useState<
    Tables<"article"> | "new" | null
  >(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<
    Tables<"announcement"> | "new" | null
  >(null);
  const [editingPlaylist, setEditingPlaylist] = useState<
    Tables<"playlist_with_details"> | "new" | null
  >(null);

  const debouncedSearch = useDebouncedValue(search);
  const params = { page, pageSize: PAGE_SIZE, search: debouncedSearch };

  const articles = useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: () => fetchArticles(supabase, params),
    enabled: tab === "articles",
    placeholderData: keepPreviousData,
  });

  const announcements = useQuery({
    queryKey: queryKeys.announcements.list({ ...params, admin: true }),
    queryFn: () => fetchAnnouncements(supabase, params),
    enabled: tab === "announcements",
    placeholderData: keepPreviousData,
  });

  const playlists = useQuery({
    queryKey: queryKeys.playlists.list(params),
    queryFn: () => fetchPlaylists(supabase, params),
    enabled: tab === "playlists",
    placeholderData: keepPreviousData,
  });

  const articleItems = useMemo(() => {
    const raw = articles.data?.data ?? [];
    if (timeFilter === "all") return raw;
    return raw.filter((item) =>
      isWithinDays(item.added_at, Number(timeFilter)),
    );
  }, [articles.data?.data, timeFilter]);

  const announcementItems = useMemo(() => {
    const raw = announcements.data?.data ?? [];
    if (timeFilter === "all") return raw;
    return raw.filter((item) =>
      isWithinDays(item.start_date, Number(timeFilter)),
    );
  }, [announcements.data?.data, timeFilter]);

  const playlistItems = useMemo(() => {
    const raw = playlists.data?.data ?? [];
    if (timeFilter === "all") return raw;
    return raw;
  }, [playlists.data?.data, timeFilter]);

  function handleAddNew() {
    if (tab === "articles") setEditingArticle("new");
    else if (tab === "announcements") setEditingAnnouncement("new");
    else setEditingPlaylist("new");
  }

  async function handleDelete(
    table: "article" | "announcement" | "playlist",
    id: string,
    title: string,
  ) {
    const ok = await confirm({
      title: `Delete "${title}"?`,
      description:
        "This item will be permanently removed from the Portal and landing page.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;

    startDelete(async () => {
      const result = await deleteContent(table, id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Item deleted");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.articles.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.announcements.all,
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all }),
      ]);
    });
  }

  const activeQuery =
    tab === "articles"
      ? articles
      : tab === "announcements"
        ? announcements
        : playlists;

  const totalCount =
    tab === "articles"
      ? (articles.data?.count ?? 0)
      : tab === "announcements"
        ? (announcements.data?.count ?? 0)
        : (playlists.data?.count ?? 0);

  const visibleCount =
    tab === "articles"
      ? articleItems.length
      : tab === "announcements"
        ? announcementItems.length
        : playlistItems.length;

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const newButtonLabel =
    tab === "articles"
      ? "New Article"
      : tab === "announcements"
        ? "New Announcement"
        : "New Playlist";

  return (
    <>
      <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
        {/* Top Row: PillTabs + Primary New Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PillTabs
            ariaLabel="CMS content type"
            value={tab}
            onChange={(next) => {
              setTab(next as CmsTab);
              setPage(0);
            }}
            options={[
              { value: "articles", label: "Article" },
              { value: "announcements", label: "Announcements and Events" },
              { value: "playlists", label: "Playlists" },
            ]}
          />

          <Button type="button" onClick={handleAddNew}>
            <Plus strokeWidth={1.5} className="size-4" />
            {newButtonLabel}
          </Button>
        </div>

        {/* Search + Time Range Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="border-border bg-card shadow-steady-card flex h-12 flex-1 items-center gap-3 rounded-[25px] border px-5">
            <Search
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search announcements, articles, or playlists..."
              className="w-full bg-transparent text-[15px] outline-none"
            />
          </div>

          <Select
            value={timeFilter}
            onValueChange={(v) => {
              setTimeFilter(v as TimeFilter);
              setPage(0);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Published</SelectLabel>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 3-Column Content Card Grid */}
        {activeQuery.isError ? (
          <ErrorState
            title={`Couldn't load ${tab}`}
            onRetry={() => activeQuery.refetch()}
          />
        ) : activeQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[360px] w-full rounded-[20px]" />
            ))}
          </div>
        ) : visibleCount === 0 ? (
          <EmptyState
            icon={
              tab === "articles"
                ? BookOpen
                : tab === "announcements"
                  ? Megaphone
                  : Music
            }
            title={`No ${tab} found`}
            description="Try a different search term or create a new item."
            action={
              <Button type="button" onClick={handleAddNew}>
                <Plus strokeWidth={1.5} className="size-4" />
                {newButtonLabel}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tab === "articles" &&
              articleItems.map((item) => (
                <CmsCard
                  key={item.id}
                  badge={item.publisher_name || "Wellness"}
                  title={item.title}
                  description={item.content || ""}
                  meta={`Written by ${item.author_name || "UGCS Editorial"}`}
                  metaIcon={UserRound}
                  coverUrl={item.article_image}
                  fallbackIcon={BookOpen}
                  disabled={isDeleting}
                  onEdit={() => setEditingArticle(item)}
                  onDelete={() => handleDelete("article", item.id, item.title)}
                />
              ))}

            {tab === "announcements" &&
              announcementItems.map((item) => (
                <CmsCard
                  key={item.id}
                  badge={item.location || "Campus Event"}
                  title={item.title}
                  description={item.description || ""}
                  meta={
                    item.start_date
                      ? new Date(item.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Campus Announcement"
                  }
                  metaIcon={Calendar}
                  coverUrl={item.announcement_image}
                  fallbackIcon={Megaphone}
                  disabled={isDeleting}
                  onEdit={() => setEditingAnnouncement(item)}
                  onDelete={() =>
                    handleDelete("announcement", item.id, item.title)
                  }
                />
              ))}

            {tab === "playlists" &&
              playlistItems.map((item) => (
                <CmsCard
                  key={item.id ?? item.title}
                  badge={item.emotional_status_name || "Soundscape"}
                  title={item.title ?? "Untitled Playlist"}
                  description={
                    item.emotional_status_name
                      ? `Curated playlist for feeling ${item.emotional_status_name.toLowerCase()}.`
                      : "Curated campus wellness soundscape."
                  }
                  meta={item.creator || "Steady Audio"}
                  metaIcon={Music}
                  coverUrl={item.image}
                  fallbackIcon={Music}
                  disabled={isDeleting || !item.id}
                  onEdit={() => setEditingPlaylist(item)}
                  onDelete={() => {
                    if (item.id) {
                      void handleDelete(
                        "playlist",
                        item.id,
                        item.title ?? "Playlist",
                      );
                    }
                  }}
                />
              ))}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-muted-foreground text-[15px]">
            View {visibleCount} out of {totalCount} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page + 1 >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {editingArticle && (
        <ArticleDialog
          article={editingArticle === "new" ? null : editingArticle}
          onClose={() => setEditingArticle(null)}
        />
      )}
      {editingAnnouncement && (
        <AnnouncementDialog
          announcement={
            editingAnnouncement === "new" ? null : editingAnnouncement
          }
          onClose={() => setEditingAnnouncement(null)}
        />
      )}
      {editingPlaylist && (
        <PlaylistDialog
          playlist={editingPlaylist === "new" ? null : editingPlaylist}
          onClose={() => setEditingPlaylist(null)}
        />
      )}
    </>
  );
}

function CmsCard({
  badge,
  title,
  description,
  meta,
  metaIcon: MetaIcon,
  coverUrl,
  fallbackIcon: FallbackIcon,
  disabled,
  onEdit,
  onDelete,
}: {
  badge: string;
  title: string;
  description: string;
  meta: string;
  metaIcon: typeof UserRound;
  coverUrl?: string | null;
  fallbackIcon: typeof BookOpen;
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-4 rounded-[20px] border p-4">
      <div className="space-y-3.5">
        {/* Top Cover Image + Badge + Open Arrow (Figma 678:21004) */}
        <div className="bg-muted relative h-[168px] w-full overflow-hidden rounded-[15px]">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={title}
              className="size-full object-cover"
            />
          ) : (
            <div className="from-primary/15 to-primary/5 flex size-full items-center justify-center bg-linear-to-br">
              <FallbackIcon
                strokeWidth={1.5}
                className="text-primary/60 size-10"
              />
            </div>
          )}

          <SteadyLabel
            size="sm"
            className="bg-card/95 absolute top-3 left-3 max-w-[65%] truncate backdrop-blur-xs"
          >
            {badge}
          </SteadyLabel>

          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title}`}
            className="bg-card/95 text-foreground hover:bg-card shadow-steady-card absolute top-3 right-3 flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors"
          >
            <ArrowUpRight strokeWidth={1.5} className="size-4" />
          </button>
        </div>

        {/* Title, Excerpt & Meta Pill */}
        <div className="space-y-2">
          <h3 className="text-foreground line-clamp-2 text-[18px] leading-snug font-medium">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground line-clamp-3 text-[14px] leading-relaxed">
              {description}
            </p>
          )}
          <div className="pt-1">
            <SteadyLabel
              icon={MetaIcon}
              size="sm"
              className="text-muted-foreground max-w-full"
            >
              {meta}
            </SteadyLabel>
          </div>
        </div>
      </div>

      {/* Bottom Action Row: Delete (Left) & Edit (Right) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="destructive"
          disabled={disabled}
          onClick={onDelete}
        >
          Delete
        </Button>
        <Button type="button" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </article>
  );
}
