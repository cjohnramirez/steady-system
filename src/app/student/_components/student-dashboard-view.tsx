"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  MapPin,
  Sparkles,
  User,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SteadyMascot } from "@/components/app/steady-mascot";
import { UserAvatar } from "@/components/app/user-avatar";
import { toggleActionItem } from "@/lib/actions/clinical";
import type { ActionPlanItem } from "@/components/student/action-plan-card";
import {
  ArticleReaderDialog,
  type WellnessArticle,
} from "@/components/student/article-reader-dialog";
import { cn } from "@/lib/utils";

const BreathingPacerDialog = dynamic(
  () =>
    import("@/components/student/breathing-pacer-dialog").then(
      (mod) => mod.BreathingPacerDialog,
    ),
  { ssr: false },
);

const MOOD_CARDS = [
  {
    name: "Anxious",
    description: "Heart racing, tight chest, deadline dread",
    orb: "#ff9f43",
    ring: "border-warning",
  },
  {
    name: "Overwhelmed",
    description: "Too many responsibilities at once",
    orb: "#ff5c6c",
    ring: "border-destructive",
  },
  {
    name: "Exhausted",
    description: "Severe sleep deficit & mental fatigue",
    orb: "#2b7fff",
    ring: "border-primary",
  },
  {
    name: "Stressed",
    description: "High pressure from exams or family",
    orb: "#00bc7d",
    ring: "border-positive",
  },
  {
    name: "Calm",
    description: "Breathing steady and feeling centered",
    orb: "#10b981",
    ring: "border-positive",
  },
  {
    name: "Hopeful",
    description: "Seeing progress and next steps clearly",
    orb: "#7c3aed",
    ring: "border-primary",
  },
  {
    name: "Lonely",
    description: "Homesick or feeling isolated in dorms",
    orb: "#f472b6",
    ring: "border-primary",
  },
  {
    name: "Yearning",
    description: "Longing for clarity, rest, or connection",
    orb: "#8b5cf6",
    ring: "border-primary",
  },
] as const;

export interface StudentDashboardProps {
  firstName: string;
  initialMood: string | null;
  upcomingSession: {
    id: string;
    counselorName: string;
    officeRoom: string;
    scheduledLabel: string;
    durationMinutes: number;
  } | null;
  initialActionItems: ActionPlanItem[];
  featuredEvent: {
    id: string;
    title: string;
    description: string;
    dateLabel: string;
    location: string;
    imageUrl?: string | null;
  } | null;
  featuredArticle: WellnessArticle | null;
}

export function StudentDashboardView({
  firstName,
  initialMood,
  upcomingSession,
  initialActionItems,
  featuredEvent,
  featuredArticle,
}: StudentDashboardProps) {
  const [selectedMood, setSelectedMood] = useState(initialMood ?? "Calm");
  const [items, setItems] = useState<ActionPlanItem[]>(initialActionItems);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const completedCount = items.filter((i) => i.is_completed).length;
  const pct =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  function handleToggle(item: ActionPlanItem) {
    const next = !item.is_completed;
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, is_completed: next } : row,
      ),
    );
    startTransition(async () => {
      const res = await toggleActionItem({ id: item.id, is_completed: next });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? { ...row, is_completed: item.is_completed }
              : row,
          ),
        );
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Hero Welcome Container (Figma 678:19256 top card) */}
      <section className="bg-card border-border shadow-steady-card relative overflow-hidden rounded-[20px] border p-6">
        {/* Decorative Peeking Mascots Top-Right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-5 right-6 hidden items-end gap-2 sm:flex"
        >
          <div className="size-16 overflow-hidden rounded-full shadow-md">
            <SteadyMascot tone="emerald" proximityRadius={220} />
          </div>
          <div className="size-24 overflow-hidden rounded-full shadow-md">
            <SteadyMascot tone="blue" proximityRadius={260} />
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="max-w-lg space-y-1">
            <h1 className="text-[28px] font-medium tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-muted-foreground text-[15px] leading-snug">
              Take a slow breath. Your sessions, self-care action steps, and
              counseling resources are centered right here.
            </p>
          </div>

          {/* Upcoming Session Strip */}
          <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-4">
            <div className="flex flex-wrap items-center gap-4">
              <UserAvatar
                name={upcomingSession?.counselorName ?? "Counselor"}
                className="size-11 shrink-0 rounded-[10px]"
              />
              {upcomingSession ? (
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[15px]">
                  <div>
                    <p className="font-medium">
                      Upcoming Session with {upcomingSession.counselorName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Proceed to {upcomingSession.officeRoom}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Scheduled At</p>
                    <p className="text-muted-foreground text-sm">
                      {upcomingSession.scheduledLabel} (
                      {upcomingSession.durationMinutes} mins)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium">No upcoming session scheduled</p>
                  <p className="text-muted-foreground text-sm">
                    Book a confidential 30-minute check-in whenever you need
                    support.
                  </p>
                </div>
              )}
            </div>

            <Button asChild size="sm">
              <Link
                href={
                  upcomingSession
                    ? "/student/appointments"
                    : "/student/appointment"
                }
              >
                {upcomingSession ? "View Details" : "Book a Session"}
              </Link>
            </Button>
          </div>

          {/* My Action Plan & Coping Steps (2-column grid matching Figma) */}
          <div className="bg-card border-border shadow-steady-card space-y-4 rounded-[20px] border p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-medium">
                  My Action Plan &amp; Coping Steps
                </h2>
                <p className="text-muted-foreground text-sm">
                  Agreed homework agreements from your recent consultation/s
                </p>
              </div>
              <div className="border-border flex items-center gap-3 rounded-full border px-3.5 py-1.5 text-xs">
                <span className="font-medium">{pct}% Complete</span>
                <div className="bg-muted h-1.5 w-20 overflow-hidden rounded-full">
                  <div
                    className="bg-positive h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-muted-foreground py-3 text-sm">
                No action steps assigned yet. Steps shared by your counselor
                will appear here.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2" aria-busy={isPending}>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.is_completed}
                    onClick={() => handleToggle(item)}
                    className={cn(
                      "flex items-start gap-3 rounded-[16px] border p-4 text-left text-[15px] transition-colors",
                      item.is_completed
                        ? "border-positive/60 bg-positive/10"
                        : "border-border bg-card hover:bg-muted/40",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
                        item.is_completed
                          ? "border-positive bg-positive text-positive-foreground"
                          : "border-input bg-card",
                      )}
                    >
                      {item.is_completed && <Check className="size-3.5" />}
                    </span>
                    <span className="leading-snug">{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Mood Check-in + Breathing Banner (Figma 678:19256 middle card) */}
      <section className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-medium">
              How are you feeling right now?
            </h2>
            <p className="text-muted-foreground text-sm">
              Tap a state to adapt your reading recommendations and wellness
              resources.
            </p>
          </div>
          <span className="border-border bg-card rounded-full border px-4 py-2 text-sm">
            Currently selected{" "}
            <strong className="font-semibold">{selectedMood}</strong>
          </span>
        </div>

        {/* 4x2 Expressive Mood Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOOD_CARDS.map((mood) => {
            const isSelected =
              selectedMood.toLowerCase() === mood.name.toLowerCase();
            return (
              <button
                key={mood.name}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedMood(mood.name);
                  toast.success(`Mood updated to ${mood.name}`);
                }}
                className={cn(
                  "bg-card shadow-steady-card relative flex min-h-[126px] flex-col items-start justify-between overflow-hidden rounded-[18px] p-4 text-left transition-[border-color,transform] active:scale-[0.99]",
                  isSelected
                    ? `border-2 ${mood.ring}`
                    : "border-border hover:border-foreground/30 border",
                )}
              >
                <div className="relative z-10 max-w-[78%] space-y-1">
                  <p className="text-[15px] font-medium">{mood.name}</p>
                  <p className="text-muted-foreground text-xs leading-snug">
                    {mood.description}
                  </p>
                </div>
                {/* Peeking Colored Mood Orb */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -bottom-4 flex size-16 items-center justify-center rounded-full shadow-inner"
                  style={{ backgroundColor: mood.orb }}
                >
                  <span className="flex -translate-x-1 -translate-y-1 gap-1.5">
                    <span className="h-3 w-1.5 rounded-full bg-white" />
                    <span className="h-3 w-1.5 rounded-full bg-white" />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 4-7-8 Breathing Pacer Strip */}
        <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[18px] border p-5">
          <div className="space-y-0.5">
            <p className="text-[15px] font-medium">
              Feeling tense or racing thoughts?
            </p>
            <p className="text-muted-foreground text-sm">
              Take 2 minutes for guided 4-7-8 diaphragmatic breathing circuit
              breaker.
            </p>
          </div>
          <Button type="button" onClick={() => setBreathingOpen(true)}>
            <Wind className="size-4" />
            Start 4-7-8 Pacer
          </Button>
        </div>
      </section>

      {/* 3. Portal, Curated For You (Figma 678:19256 bottom section) */}
      <section className="space-y-4">
        <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-6">
          <div className="space-y-1">
            <h2 className="text-[22px] font-medium">Portal, Curated For You</h2>
            <p className="text-muted-foreground text-sm">
              Here are sample contents from the portal, based on your selected
              mood. The portal automatically updates with your mood as well!
            </p>
          </div>
          <Button asChild>
            <Link href="/student/wellness">
              <ArrowRight className="size-4" />
              View Portal
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Next Event Card */}
          <div className="bg-card border-border shadow-steady-card flex flex-col gap-4 rounded-[20px] border p-5">
            <div className="bg-brand-subtle relative h-48 w-full overflow-hidden rounded-[16px]">
              {featuredEvent?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="from-primary/20 via-brand-subtle to-positive/15 flex size-full items-center justify-center bg-gradient-to-br">
                  <Calendar className="text-primary size-10 opacity-60" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
                <Calendar className="size-3" />
                Next Event
              </span>
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
                <Sparkles className="size-3" />
                Mental Health
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-[17px] font-medium">
                  {featuredEvent?.title ?? "Stress Management Workshop"}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {featuredEvent?.description ??
                    "Learn practical techniques to reduce exam stress and build steady daily habits."}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                asChild
                className="shrink-0 rounded-full"
              >
                <Link href="/portal" aria-label="View event in portal">
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Clock className="size-3" />
                {featuredEvent?.dateLabel ?? "Upcoming this month"}
              </span>
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <MapPin className="size-3" />
                {featuredEvent?.location ?? "UGCS Main Hall"}
              </span>
            </div>
          </div>

          {/* Featured Article Card */}
          <div className="bg-card border-border shadow-steady-card flex flex-col gap-4 rounded-[20px] border p-5">
            <div className="bg-brand-subtle relative h-48 w-full overflow-hidden rounded-[16px]">
              {featuredArticle?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="from-positive/20 via-brand-subtle to-primary/15 flex size-full items-center justify-center bg-gradient-to-br">
                  <BookOpen className="text-primary size-10 opacity-60" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
                <BookOpen className="size-3" />
                Featured Article
              </span>
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
                <User className="size-3" />
                Written By {featuredArticle?.author ?? "UGCS Team"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-[17px] font-medium">
                  {featuredArticle?.title ??
                    "Harnessing Focus: Techniques to Stay Sharp During Exam Season"}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-sm">
                  {featuredArticle?.summary ??
                    "Explore mindfulness exercises, strategic breaks, and study rhythms that enhance concentration."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => featuredArticle && setArticleOpen(true)}
                aria-label="Read featured article"
                className="shrink-0 rounded-full"
              >
                <ArrowUpRight className="size-4" />
              </Button>
            </div>

            <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
              <span className="border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                {featuredArticle?.readMinutes ?? 5} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      <BreathingPacerDialog
        open={breathingOpen}
        onOpenChange={setBreathingOpen}
      />
      <ArticleReaderDialog
        open={articleOpen}
        onOpenChange={setArticleOpen}
        article={featuredArticle}
      />
    </div>
  );
}
