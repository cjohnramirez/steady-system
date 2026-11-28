"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  MapPin,
  Tag,
  User,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  SteadyMascot,
  type MascotEmotion,
} from "@/components/app/steady-mascot";
import { SteadyLabel } from "@/components/app/steady-label";
import { CircleArrowButton } from "@/components/app/circle-arrow-button";
import { UserAvatar } from "@/components/app/user-avatar";
import { toggleActionItem } from "@/lib/actions/clinical";
import type { ActionPlanItem } from "@/components/student/action-plan-card";
import {
  ArticleReaderDialog,
  type WellnessArticle,
} from "@/components/student/article-reader-dialog";
import {
  CounselorDetailsDialog,
  type CounselorProfileInfo,
} from "@/components/student/counselor-details-dialog";
import { cn } from "@/lib/utils";

const BreathingPacerDialog = dynamic(
  () =>
    import("@/components/student/breathing-pacer-dialog").then(
      (mod) => mod.BreathingPacerDialog,
    ),
  { ssr: false },
);

const MOOD_CARDS: {
  name: string;
  emotion: Exclude<MascotEmotion, "default">;
  description: string;
  ringVar: string;
}[] = [
  {
    name: "Anxious",
    emotion: "anxious",
    description: "Heart racing, tight chest, deadline dread",
    ringVar: "var(--emotion-anxious)",
  },
  {
    name: "Overwhelmed",
    emotion: "overwhelmed",
    description: "Too many responsibilities at once",
    ringVar: "var(--emotion-overwhelmed)",
  },
  {
    name: "Exhausted",
    emotion: "exhausted",
    description: "Severe sleep deficit & mental fatigue",
    ringVar: "var(--emotion-exhausted)",
  },
  {
    name: "Stressed",
    emotion: "stressed",
    description: "High pressure from exams or family",
    ringVar: "var(--emotion-stressed)",
  },
  {
    name: "Calm",
    emotion: "calm",
    description: "Breathing steady and feeling centered",
    ringVar: "var(--emotion-calm)",
  },
  {
    name: "Hopeful",
    emotion: "hopeful",
    description: "Seeing progress and next steps clearly",
    ringVar: "var(--emotion-hopeful)",
  },
  {
    name: "Lonely",
    emotion: "lonely",
    description: "Homesick or feeling isolated in dorms",
    ringVar: "var(--emotion-lonely)",
  },
  {
    name: "Reflective",
    emotion: "reflective",
    description: "Needing quiet space to think things through",
    ringVar: "var(--emotion-reflective)",
  },
];

const STARTER_ACTION_ITEMS: ActionPlanItem[] = [
  {
    id: "starter-1",
    title: "Have aunt drop off homecooked food container tonight",
    is_completed: true,
    due_date: null,
  },
  {
    id: "starter-2",
    title: "Take 15-min phone-free walk around campus before dinner",
    is_completed: false,
    due_date: null,
  },
  {
    id: "starter-3",
    title: "Sign and submit dean's overload reduction waiver",
    is_completed: false,
    due_date: null,
  },
  {
    id: "starter-4",
    title: "Send email to Prof. Ramos requesting project extension",
    is_completed: false,
    due_date: null,
  },
];

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
  counselorProfile?: CounselorProfileInfo | null;
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
  counselorProfile,
  initialActionItems,
  featuredEvent,
  featuredArticle,
}: StudentDashboardProps) {
  const [selectedMood, setSelectedMood] = useState(initialMood ?? "Calm");
  const isStarterItems = initialActionItems.length === 0;
  const [items, setItems] = useState<ActionPlanItem[]>(
    isStarterItems ? STARTER_ACTION_ITEMS : initialActionItems,
  );
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [counselorOpen, setCounselorOpen] = useState(false);
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
    if (isStarterItems || item.id.startsWith("starter-")) return;

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
      {/* 1. Hero Welcome Container with Dot Grid + Gradient (Figma 678:19267) */}
      <section className="bg-steady-dot-grid border-border shadow-steady-card relative overflow-hidden rounded-[20px] border p-6">
        {/* Decorative Peeking Mascots Top-Right (exact Figma scale, tucked behind session bar) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[210px] sm:block"
        >
          <div className="absolute top-[52px] right-[192px] size-[106px]">
            <SteadyMascot
              variant="orb"
              tone="emerald"
              eyeAnchor="tr"
              proximityRadius={260}
            />
          </div>
          <div className="absolute -top-[52px] right-[24px] size-[186px]">
            <SteadyMascot
              variant="orb"
              tone="blue"
              eyeAnchor="bl"
              proximityRadius={320}
            />
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="max-w-lg space-y-1">
            <h1 className="text-[28px] font-medium tracking-tight">
              Welcome Back, {firstName}!
            </h1>
            <p className="text-muted-foreground text-[15px] leading-snug">
              Take a slow breath. Your sessions, self-care action steps, and
              counseling resources are centered right here.
            </p>
          </div>

          {/* Upcoming Session Bar */}
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
                      Upcoming Session With {upcomingSession.counselorName}
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
                  <p className="font-medium">No Upcoming Session Scheduled</p>
                  <p className="text-muted-foreground text-sm">
                    Book a confidential check-in whenever you need support.
                  </p>
                </div>
              )}
            </div>

            {upcomingSession && counselorProfile ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setCounselorOpen(true)}
              >
                View Details
              </Button>
            ) : (
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
            )}
          </div>

          {/* My Action Plan & Coping Steps (Figma 678:19319) */}
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
              <SteadyLabel size="md" progress={pct}>
                {pct}% Complete
              </SteadyLabel>
            </div>

            <div
              className="grid gap-[8px] md:grid-cols-2"
              aria-busy={isPending}
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={item.is_completed}
                  onClick={() => handleToggle(item)}
                  className={cn(
                    "shadow-steady-card flex cursor-pointer items-start gap-[15px] rounded-[19px] border p-[20px] text-left text-[15px] transition-colors",
                    item.is_completed
                      ? "border-[#009966] bg-[#ecfdf5] dark:border-emerald-500 dark:bg-emerald-950/35"
                      : "border-border bg-card hover:border-foreground/30",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                      item.is_completed
                        ? "border-[#009966] bg-[#009966] text-white"
                        : "border-border bg-background",
                    )}
                  >
                    {item.is_completed && (
                      <Check strokeWidth={2.5} className="size-3" />
                    )}
                  </span>
                  <span className="text-foreground leading-snug">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mood Check-In + 4-7-8 Breathing Strip */}
      <section className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-medium">
              How Are You Feeling Right Now?
            </h2>
            <p className="text-muted-foreground text-sm">
              Tap a state to adapt your reading recommendations and wellness
              resources.
            </p>
          </div>
          <SteadyLabel size="md">
            Currently Selected{" "}
            <strong className="ml-1 font-semibold capitalize">
              {selectedMood}
            </strong>
          </SteadyLabel>
        </div>

        {/* 4x2 Expressive Mood Grid with Dot Grid + Gradient & Concise Mascot Orbs */}
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
                style={isSelected ? { borderColor: mood.ringVar } : undefined}
                className={cn(
                  "bg-steady-dot-grid shadow-steady-card relative flex min-h-[164px] cursor-pointer flex-col items-start justify-between overflow-hidden rounded-[19px] p-5 text-left transition-[border-color,transform] active:scale-[0.99]",
                  isSelected
                    ? "border-2"
                    : "border-border hover:border-foreground/30 border",
                )}
              >
                <div className="relative z-10 max-w-[78%] space-y-1">
                  <p className="text-[15px] font-medium">{mood.name}</p>
                  <p className="text-muted-foreground text-xs leading-snug">
                    {mood.description}
                  </p>
                </div>
                <div className="pointer-events-none absolute -right-[18px] -bottom-[22px] size-[107px]">
                  <SteadyMascot
                    variant="orb"
                    emotion={mood.emotion}
                    blink={false}
                    proximityRadius={180}
                    aria-label={`${mood.name} Mascot`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* 4-7-8 Breathing Pacer Strip */}
        <div className="bg-card border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[18px] border p-5">
          <div className="space-y-0.5">
            <p className="text-[15px] font-medium">
              Feeling Tense Or Racing Thoughts?
            </p>
            <p className="text-muted-foreground text-sm">
              Take 2 minutes for guided 4-7-8 diaphragmatic breathing circuit
              breaker.
            </p>
          </div>
          <Button type="button" onClick={() => setBreathingOpen(true)}>
            <Wind strokeWidth={1.5} className="size-4" />
            Start 4-7-8 Pacer
          </Button>
        </div>
      </section>

      {/* 3. Portal, Curated For You (Dot Grid Banner + 2 Matching Tiles) */}
      <section className="space-y-4">
        <div className="bg-steady-dot-grid border-border shadow-steady-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] border p-6">
          <div className="space-y-1">
            <h2 className="text-[22px] font-medium">Portal, Curated For You</h2>
            <p className="text-muted-foreground text-sm">
              Here are some sample contents from the portal, based on your
              selected mood. The portal automatically updates with your mood as
              well!
            </p>
          </div>
          <Button asChild>
            <Link href="/student/wellness">
              <ArrowRight strokeWidth={1.5} className="size-4" />
              View Portal
            </Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Next Event Tile */}
          <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-4 rounded-[20px] border p-5">
            <div className="space-y-4">
              <div className="bg-brand-subtle relative h-52 w-full overflow-hidden rounded-[16px]">
                {featuredEvent?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredEvent.imageUrl}
                    alt={featuredEvent.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="from-primary/20 via-brand-subtle to-positive/15 flex size-full items-center justify-center bg-gradient-to-br">
                    <Calendar
                      strokeWidth={1.5}
                      className="text-primary size-10 opacity-60"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <SteadyLabel icon={Calendar}>Next Event</SteadyLabel>
                <SteadyLabel icon={Tag}>Mental Health</SteadyLabel>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-[17px] font-medium">
                    {featuredEvent?.title ?? "Stress Management Workshop"}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {featuredEvent?.description ??
                      "Learn quick techniques to reduce stress during exams."}
                  </p>
                </div>
                <CircleArrowButton
                  href="/portal"
                  ariaLabel="Open Event In Portal"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SteadyLabel icon={Clock}>
                {featuredEvent?.dateLabel ?? "Upcoming This Month"}
              </SteadyLabel>
              <SteadyLabel icon={MapPin}>
                {featuredEvent?.location ?? "LRC Building, Room LRC-102"}
              </SteadyLabel>
            </div>
          </div>

          {/* Featured Article Tile */}
          <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-4 rounded-[20px] border p-5">
            <div className="space-y-4">
              <div className="bg-brand-subtle relative h-52 w-full overflow-hidden rounded-[16px]">
                {featuredArticle?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="from-positive/20 via-brand-subtle to-primary/15 flex size-full items-center justify-center bg-gradient-to-br">
                    <BookOpen
                      strokeWidth={1.5}
                      className="text-primary size-10 opacity-60"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <SteadyLabel icon={BookOpen}>Featured Article</SteadyLabel>
                <SteadyLabel icon={User}>
                  Written By {featuredArticle?.author ?? "Dr. Lee"}
                </SteadyLabel>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-[17px] font-medium">
                    {featuredArticle?.title ??
                      "Harnessing Focus: Techniques To Stay Sharp During Exam Season"}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {featuredArticle?.summary ??
                      "Explore mindfulness exercises, strategic breaks, and study rhythms that enhance concentration."}
                  </p>
                </div>
                <CircleArrowButton
                  onClick={() => featuredArticle && setArticleOpen(true)}
                  ariaLabel="Read Featured Article"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SteadyLabel>
                {featuredArticle?.readMinutes ?? 10} Min Read
              </SteadyLabel>
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
      <CounselorDetailsDialog
        open={counselorOpen}
        onOpenChange={setCounselorOpen}
        counselor={counselorProfile ?? null}
      />
    </div>
  );
}
