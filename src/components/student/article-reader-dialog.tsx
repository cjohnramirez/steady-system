"use client";

import { BookOpen, Clock, ExternalLink, Wind } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface WellnessArticle {
  id: string;
  title: string;
  author: string;
  mood?: string | null;
  readMinutes?: number;
  summary: string;
  body?: string[];
  url?: string | null;
}

export function ArticleReaderDialog({
  open,
  onOpenChange,
  article,
  onOpenBreathing,
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-subtle text-brand-subtle-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
              <BookOpen className="size-3.5" />
              {article.mood
                ? `For when you feel ${article.mood}`
                : "Wellness Reading"}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Clock className="size-3.5" />
              {article.readMinutes ?? 4} min read
            </span>
          </div>
          <DialogTitle className="text-xl leading-snug">
            {article.title}
          </DialogTitle>
          <DialogDescription>By {article.author}</DialogDescription>
        </DialogHeader>

        <article className="space-y-4 py-1 text-sm leading-7">
          {paragraphs.map((para, index) => (
            <p key={index} className="text-foreground/90">
              {para}
            </p>
          ))}
        </article>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {onOpenBreathing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenBreathing();
                }}
              >
                <Wind className="text-primary size-4" />
                Try 4-7-8 Breathing
              </Button>
            )}
            {article.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Open full source
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
          <Button variant="positive" onClick={() => onOpenChange(false)}>
            Done reading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
