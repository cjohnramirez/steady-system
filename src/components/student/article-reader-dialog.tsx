"use client";

import { Calendar, Eye, PenLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/app/markdown-content";

export interface WellnessArticle {
  id: string;
  title: string;
  author: string;
  mood?: string | null;
  readMinutes?: number;
  summary: string;
  body?: string[];
  url?: string | null;
  imageUrl?: string | null;
  lastReadLabel?: string;
  writtenAgoLabel?: string;
}

export function ArticleReaderDialog({
  open,
  onOpenChange,
  article,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: WellnessArticle | null;
  onOpenBreathing?: () => void;
}) {
  if (!article) return null;

  const paragraphs =
    article.body && article.body.length > 0 ? article.body : [article.summary];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        {/* Gray Header Band (Figma 688:1258) */}
        <div className="bg-muted/60 border-border shrink-0 space-y-2 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[20px] leading-snug font-medium">
            {article.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Article written by {article.author}
          </DialogDescription>
          <div className="flex flex-wrap items-center gap-1.5">
            {article.mood && (
              <span className="bg-card border-border shadow-steady-card inline-flex items-center justify-center rounded-[35px] border px-3.5 py-2 text-[14px]">
                {article.mood}
              </span>
            )}
            <span className="bg-card border-border shadow-steady-card inline-flex items-center gap-2 rounded-[35px] border px-3.5 py-2 text-[14px]">
              <PenLine className="size-3.5 shrink-0" />
              <span>Written by {article.author}</span>
            </span>
          </div>
        </div>

        {/* Scrollable White Body (Figma 688:1263) */}
        <div className="bg-card flex-1 overflow-y-auto p-5">
          <div className="space-y-5">
            {/* Cover Banner (Figma 702:27984, 217px rounded-[19px]) */}
            <div className="bg-brand-subtle relative h-[217px] w-full overflow-hidden rounded-[19px]">
              {article.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="from-primary/20 via-brand-subtle to-positive/15 flex size-full items-end bg-gradient-to-br p-5">
                  <span className="bg-card/85 text-foreground rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {article.mood ?? "Steady Wellness Reading"}
                  </span>
                </div>
              )}
            </div>

            {/* Meta Stack (Figma 702:27966) */}
            <div className="text-muted-foreground space-y-1.5 text-[14px]">
              <p className="flex items-center gap-2.5">
                <Eye className="size-4 shrink-0" />
                <span>{article.lastReadLabel ?? "Last Read Today"}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Calendar className="size-4 shrink-0" />
                <span>{article.writtenAgoLabel ?? "Curated by UGCS"}</span>
              </p>
            </div>

            {/* Formatted Markdown Content (Figma 702:27979) */}
            <article>
              <MarkdownContent content={paragraphs.join("\n\n")} />
            </article>
          </div>
        </div>

        {/* Gray Footer Band (Figma 688:1266) */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
