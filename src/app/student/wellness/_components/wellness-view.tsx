"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  Music,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
import { SteadyLabel } from "@/components/app/steady-label";
import {
  ArticleReaderDialog,
  type WellnessArticle,
} from "@/components/student/article-reader-dialog";

const BreathingPacerDialog = dynamic(
  () =>
    import("@/components/student/breathing-pacer-dialog").then(
      (mod) => mod.BreathingPacerDialog,
    ),
  { ssr: false },
);

export interface WellnessPlaylist {
  id: string;
  title: string;
  creator: string;
  description?: string | null;
  mood?: string | null;
  url?: string | null;
}

const ARTICLES_PER_PAGE = 3;
const PLAYLISTS_PER_PAGE = 3;

const PLAYLIST_THEMES = [
  { mood: "Happy", bg: "#2b7fff" },
  { mood: "Stressed", bg: "#f98f1d" },
  { mood: "Relaxed", bg: "#ff6b6b" },
  { mood: "Calm", bg: "#00bc7d" },
  { mood: "Reflective", bg: "#7c5cff" },
  { mood: "Hopeful", bg: "#0ea5e9" },
] as const;

const ARTICLE_FALLBACK_GRADIENTS = [
  "from-primary/20 via-brand-subtle to-positive/20",
  "from-amber-200/40 via-orange-100/50 to-rose-200/40 dark:from-amber-900/30 dark:via-orange-950/30 dark:to-rose-900/30",
  "from-emerald-200/40 via-teal-100/50 to-sky-200/40 dark:from-emerald-900/30 dark:via-teal-950/30 dark:to-sky-900/30",
] as const;

function detectPlatform(url?: string | null): string {
  if (!url) return "Streaming Audio";
  const lower = url.toLowerCase();
  if (lower.includes("spotify")) return "Spotify";
  if (lower.includes("youtube") || lower.includes("youtu.be"))
    return "YouTube Music";
  if (lower.includes("apple.com")) return "Apple Music";
  if (lower.includes("soundcloud")) return "SoundCloud";
  return "Web Audio";
}

export function WellnessView({
  articles,
  playlists,
}: {
  articles: WellnessArticle[];
  playlists: WellnessPlaylist[];
}) {
  const [articleSearch, setArticleSearch] = useState("");
  const [articlePage, setArticlePage] = useState(0);

  const [playlistSearch, setPlaylistSearch] = useState("");
  const [playlistPage, setPlaylistPage] = useState(0);

  const [selectedArticle, setSelectedArticle] =
    useState<WellnessArticle | null>(null);
  const [breathingOpen, setBreathingOpen] = useState(false);

  const filteredArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        (a.mood ?? "").toLowerCase().includes(q),
    );
  }, [articles, articleSearch]);

  const articlePageCount = Math.max(
    1,
    Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE),
  );
  const safeArticlePage = Math.min(articlePage, articlePageCount - 1);
  const visibleArticles = filteredArticles.slice(
    safeArticlePage * ARTICLES_PER_PAGE,
    (safeArticlePage + 1) * ARTICLES_PER_PAGE,
  );

  const filteredPlaylists = useMemo(() => {
    const q = playlistSearch.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.creator.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.mood ?? "").toLowerCase().includes(q),
    );
  }, [playlists, playlistSearch]);

  const playlistPageCount = Math.max(
    1,
    Math.ceil(filteredPlaylists.length / PLAYLISTS_PER_PAGE),
  );
  const safePlaylistPage = Math.min(playlistPage, playlistPageCount - 1);
  const visiblePlaylists = filteredPlaylists.slice(
    safePlaylistPage * PLAYLISTS_PER_PAGE,
    (safePlaylistPage + 1) * PLAYLISTS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Guidance Articles & Self-Help Guides (Figma 678:20064) */}
      <section className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5 sm:p-7">
        <div className="space-y-3">
          <h2 className="text-foreground text-[18px] font-medium sm:text-[20px]">
            Guidance Articles &amp; Self-Help Guides
          </h2>
          <div className="bg-card border-border focus-within:ring-ring/40 shadow-steady-card flex h-12 w-full items-center gap-2.5 rounded-[35px] border px-5 transition-shadow focus-within:ring-[3px]">
            <Search
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              type="search"
              value={articleSearch}
              onChange={(e) => {
                setArticleSearch(e.target.value);
                setArticlePage(0);
              }}
              placeholder="Search wellness articles, playlists, or mood topics..."
              aria-label="Search guidance articles"
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[14px] outline-none"
            />
          </div>
        </div>

        {visibleArticles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              articleSearch.trim()
                ? "No Matching Articles"
                : "No Wellness Articles Yet"
            }
            description={
              articleSearch.trim()
                ? "Try a different keyword or clear your search."
                : "Check back soon for curated reading from the Guidance & Counselling Office."
            }
            action={
              articleSearch.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setArticleSearch("");
                    setArticlePage(0);
                  }}
                >
                  Clear Search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleArticles.map((article, idx) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setSelectedArticle(article)}
                className="bg-card border-border shadow-steady-card hover:border-foreground/30 focus-visible:ring-ring/50 group flex cursor-pointer flex-col justify-between gap-5 rounded-[30px] border p-5 text-left transition-colors outline-none focus-visible:ring-[3px]"
              >
                <div className="w-full space-y-4">
                  {/* Cover Banner with Top-Left Mood Pill & Top-Right Circle Arrow */}
                  <div className="relative flex h-[160px] w-full items-start justify-between overflow-hidden rounded-[19px] p-4">
                    {article.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          ARTICLE_FALLBACK_GRADIENTS[
                            idx % ARTICLE_FALLBACK_GRADIENTS.length
                          ]
                        }`}
                      />
                    )}
                    <span className="bg-card/95 text-foreground shadow-steady-card relative z-10 inline-flex items-center rounded-full px-3.5 py-1.5 text-[14px] font-normal">
                      {article.mood ?? "Calm"}
                    </span>
                    <span
                      aria-hidden
                      className="bg-card border-border text-foreground shadow-steady-card relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border transition-transform group-hover:scale-[1.04]"
                    >
                      <ArrowUpRight strokeWidth={1.5} className="size-5" />
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="space-y-1.5">
                    <h3 className="text-foreground line-clamp-2 text-[18px] leading-snug font-medium">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 text-[14px] leading-snug">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Author Pill */}
                <div>
                  <SteadyLabel icon={User}>
                    Written by {article.author}
                  </SteadyLabel>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-muted-foreground text-[14px]">
            View {visibleArticles.length} out of {filteredArticles.length}{" "}
            {filteredArticles.length === 1 ? "result" : "results"}
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={safeArticlePage <= 0}
              onClick={() => setArticlePage((p) => Math.max(0, p - 1))}
              className="px-5"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={safeArticlePage + 1 >= articlePageCount}
              onClick={() =>
                setArticlePage((p) => Math.min(articlePageCount - 1, p + 1))
              }
              className="px-5"
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2: Ambient Study & Decompression Soundscapes (Figma 678:20139) */}
      <section className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5 sm:p-7">
        <div className="space-y-3">
          <h2 className="text-foreground text-[18px] font-medium sm:text-[20px]">
            Ambient Study &amp; Decompression Soundscapes
          </h2>
          <div className="bg-card border-border focus-within:ring-ring/40 shadow-steady-card flex h-12 w-full items-center gap-2.5 rounded-[35px] border px-5 transition-shadow focus-within:ring-[3px]">
            <Search
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              type="search"
              value={playlistSearch}
              onChange={(e) => {
                setPlaylistSearch(e.target.value);
                setPlaylistPage(0);
              }}
              placeholder="Search audio soundscapes or breathing guides..."
              aria-label="Search audio soundscapes"
              className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-[14px] outline-none"
            />
          </div>
        </div>

        {visiblePlaylists.length === 0 ? (
          <EmptyState
            icon={Music}
            title={
              playlistSearch.trim()
                ? "No Matching Soundscapes"
                : "No Soundscapes Published Yet"
            }
            description={
              playlistSearch.trim()
                ? "Try a different keyword or clear your search."
                : "Curated playlists from your guidance office will appear here."
            }
            action={
              playlistSearch.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPlaylistSearch("");
                    setPlaylistPage(0);
                  }}
                >
                  Clear Search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlaylists.map((pl, idx) => {
              const theme =
                PLAYLIST_THEMES[
                  (safePlaylistPage * PLAYLISTS_PER_PAGE + idx) %
                    PLAYLIST_THEMES.length
                ];
              const platform = detectPlatform(pl.url);
              const moodLabel = pl.mood ?? theme.mood;

              const cardContent = (
                <>
                  <div className="w-full space-y-4">
                    {/* Solid Color Mood Banner with Top-Left Mood Pill & Top-Right Circle Arrow */}
                    <div
                      style={{ backgroundColor: theme.bg }}
                      className="relative flex h-[160px] w-full items-start justify-between overflow-hidden rounded-[19px] p-4"
                    >
                      <span className="bg-card/95 text-foreground shadow-steady-card relative z-10 inline-flex items-center rounded-full px-3.5 py-1.5 text-[14px] font-normal">
                        {moodLabel}
                      </span>
                      <span
                        aria-hidden
                        className="bg-card border-border text-foreground shadow-steady-card relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border transition-transform group-hover:scale-[1.04]"
                      >
                        <ArrowUpRight strokeWidth={1.5} className="size-5" />
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="text-foreground line-clamp-2 text-[18px] leading-snug font-medium">
                        {pl.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 text-[14px] leading-snug">
                        {pl.description ??
                          `Curated ${moodLabel.toLowerCase()} soundscape for study and decompression.`}
                      </p>
                    </div>
                  </div>

                  {/* Stacked Platform & Creator Pills */}
                  <div className="flex flex-col items-start gap-2">
                    <SteadyLabel icon={ExternalLink}>
                      Playlist on {platform}
                    </SteadyLabel>
                    <SteadyLabel icon={User}>
                      Created by {pl.creator}
                    </SteadyLabel>
                  </div>
                </>
              );

              return pl.url ? (
                <a
                  key={pl.id}
                  href={pl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border-border shadow-steady-card hover:border-foreground/30 focus-visible:ring-ring/50 group flex flex-col justify-between gap-5 rounded-[30px] border p-5 text-left transition-colors outline-none focus-visible:ring-[3px]"
                >
                  {cardContent}
                </a>
              ) : (
                <div
                  key={pl.id}
                  className="bg-card border-border shadow-steady-card group flex flex-col justify-between gap-5 rounded-[30px] border p-5 text-left"
                >
                  {cardContent}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-muted-foreground text-[14px]">
            View {visiblePlaylists.length} out of {filteredPlaylists.length}{" "}
            {filteredPlaylists.length === 1 ? "result" : "results"}
          </p>
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={safePlaylistPage <= 0}
              onClick={() => setPlaylistPage((p) => Math.max(0, p - 1))}
              className="px-5"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={safePlaylistPage + 1 >= playlistPageCount}
              onClick={() =>
                setPlaylistPage((p) => Math.min(playlistPageCount - 1, p + 1))
              }
              className="px-5"
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      <ArticleReaderDialog
        open={Boolean(selectedArticle)}
        onOpenChange={(open) => {
          if (!open) setSelectedArticle(null);
        }}
        article={selectedArticle}
        onOpenBreathing={() => setBreathingOpen(true)}
      />

      <BreathingPacerDialog
        open={breathingOpen}
        onOpenChange={setBreathingOpen}
      />
    </div>
  );
}
