"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BookOpen, Music, Sparkles, Wind } from "lucide-react";
import { SectionCard } from "@/components/app/section-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/app/empty-state";
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
  description?: string | null;
  url?: string | null;
}

export function WellnessView({
  moodName,
  articles,
  playlists,
}: {
  moodName: string | null;
  articles: WellnessArticle[];
  playlists: WellnessPlaylist[];
}) {
  const [selectedArticle, setSelectedArticle] =
    useState<WellnessArticle | null>(null);
  const [breathingOpen, setBreathingOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-4 rounded-[20px] border p-6 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="text-primary flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="size-3.5" />
            Guided Calm Tool
          </p>
          <h2 className="text-lg font-semibold">
            Need a 60-second reset right now?
          </h2>
          <p className="text-muted-foreground text-sm">
            {moodName
              ? `Curated for when you're feeling ${moodName.toLowerCase()}. Try a gentle 4-7-8 breathing cycle.`
              : "Try a gentle 4-7-8 breathing cycle to settle your nervous system between classes."}
          </p>
        </div>
        <Button onClick={() => setBreathingOpen(true)} className="shrink-0">
          <Wind className="size-4" />
          Open 4-7-8 Breathing Pacer
        </Button>
      </div>

      <SectionCard
        title="Recommended Reading"
        description="Click any article to read in distraction-free mode."
      >
        {articles.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No wellness articles published yet"
            description="Check back soon for curated reading from the Guidance & Counselling Office."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => setSelectedArticle(article)}
                className="bg-muted/50 border-border hover:bg-muted/80 focus-visible:ring-ring/50 flex flex-col justify-between gap-3 rounded-[18px] border p-4 text-left transition-colors outline-none focus-visible:ring-[3px]"
              >
                <div className="space-y-1.5">
                  <span className="bg-brand-subtle text-brand-subtle-foreground inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {article.mood ?? "Wellness"}
                  </span>
                  <h3 className="line-clamp-2 font-semibold">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {article.summary}
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">
                  By {article.author}
                </p>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Calming Playlists"
        description="Curated audio picks for studying, unwinding, or resting."
      >
        {playlists.length === 0 ? (
          <EmptyState
            icon={Music}
            title="No playlists published yet"
            description="Curated playlists from your guidance office will appear here."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="bg-muted/50 border-border flex items-center justify-between gap-3 rounded-[18px] border p-4"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{pl.title}</p>
                  {pl.description && (
                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {pl.description}
                    </p>
                  )}
                </div>
                {pl.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={pl.url} target="_blank" rel="noopener noreferrer">
                      Listen
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

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
