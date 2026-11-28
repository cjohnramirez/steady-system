"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartNoAxesColumn, TrendingUp } from "lucide-react";
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
import { UserAvatar } from "@/components/app/user-avatar";
import { createClient } from "@/utils/supabase/client";
import type { Tables } from "@/types/supabase";
import { fetchDashboardStats, lastDays } from "@/lib/admin/dashboard";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import CounselorEditDialog from "@/app/admin/accounts/_components/counselor-edit-dialog";
import DashboardChart, { type ChartMetric } from "./dashboard-chart";

export interface CollegeCaseloadItem {
  college: string;
  count: number;
}

export interface CounselorCapacityItem {
  id: string;
  name: string;
  department: string;
  avatarUrl?: string | null;
  activeClients: number;
  status: "Overloaded" | "Moderate" | "Balanced" | "Low";
  counselor: Tables<"counselor_with_details">;
}

const RANGES = {
  "90": "Last 3 Months",
  "30": "Last 30 Days",
  "7": "Last 7 Days",
} as const;
type Range = keyof typeof RANGES;

const METRICS: Record<ChartMetric, string> = {
  visitors: "Active Student Logins",
  logins: "Logins",
  appointments: "Appointment Requests",
};

const CAPACITY_BADGE_STYLES: Record<CounselorCapacityItem["status"], string> = {
  Overloaded:
    "bg-[#ffc9c9] text-[#c10007] dark:bg-red-950/70 dark:text-red-200",
  Moderate:
    "bg-[#ffd6a7] text-[#ca3500] dark:bg-orange-950/70 dark:text-orange-200",
  Balanced:
    "bg-[#ffd6a7] text-[#ca3500] dark:bg-amber-950/70 dark:text-amber-200",
  Low: "bg-[#a4f4cf] text-[#007a55] dark:bg-emerald-950/70 dark:text-emerald-200",
};

const COUNSELOR_PAGE_SIZE = 5;

export default function DashboardView({
  collegeCaseload = [],
  counselorCapacity = [],
}: {
  collegeCaseload?: CollegeCaseloadItem[];
  counselorCapacity?: CounselorCapacityItem[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [range, setRange] = useState<Range>("30");
  const [metric, setMetric] = useState<ChartMetric>("visitors");
  const [counselorPage, setCounselorPage] = useState(0);
  const [editingCounselor, setEditingCounselor] =
    useState<Tables<"counselor_with_details"> | null>(null);

  const stats = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => fetchDashboardStats(supabase),
    staleTime: 5 * 60 * 1000,
  });

  const s = stats.data;
  const series = s ? lastDays(s.series, Number(range)) : [];
  const total = series.reduce((sum, point) => sum + point[metric], 0);

  const maxCollegeCount = Math.max(
    1,
    ...collegeCaseload.map((item) => item.count),
  );

  const counselorPageCount = Math.max(
    1,
    Math.ceil(counselorCapacity.length / COUNSELOR_PAGE_SIZE),
  );
  const safeCounselorPage = Math.min(counselorPage, counselorPageCount - 1);
  const visibleCounselors = counselorCapacity.slice(
    safeCounselorPage * COUNSELOR_PAGE_SIZE,
    (safeCounselorPage + 1) * COUNSELOR_PAGE_SIZE,
  );

  const kpiCards = [
    {
      label: "Requests Today",
      value: s?.appointments_today,
      badge: "+14%",
      trendTitle: "Trending up this month",
      showTrendIcon: true,
      subtitle: "Percentage of sessions attended",
    },
    {
      label: "Waiting for a Counselor",
      value: s?.pending_appointments,
      badge: null,
      trendTitle: "Remained Normal",
      showTrendIcon: false,
      subtitle: "Pending intake triage across colleges",
    },
    {
      label: "Visitors, Last 30 Days",
      value: s?.visitors_30d,
      badge: "+22%",
      trendTitle: "Trending up this month",
      showTrendIcon: true,
      subtitle: "Counted once per student per day",
    },
    {
      label: "Registered Students",
      value: s?.students,
      badge: "+14%",
      trendTitle: "Steady growth this term",
      showTrendIcon: true,
      subtitle: `${s?.counselors ?? 0} active guidance counselors`,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 4-Column KPI Row (Figma 678:20555) */}
      <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-5 rounded-[20px] border p-[21px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <dt className="text-foreground text-[15px] font-normal">
                  {card.label}
                </dt>
                <dd className="text-foreground text-[32px] leading-tight font-normal tabular-nums">
                  {stats.isLoading ? (
                    <Skeleton className="mt-1 h-9 w-20" />
                  ) : stats.isError ? (
                    <span
                      className="text-muted-foreground"
                      aria-label="Unavailable"
                    >
                      –
                    </span>
                  ) : (
                    (card.value ?? 0).toLocaleString()
                  )}
                </dd>
              </div>
              {card.badge && (
                <span className="bg-card border-border shadow-steady-card inline-flex shrink-0 items-center gap-1.5 rounded-[20px] border px-3.5 py-1.5 text-[15px] font-normal">
                  <TrendingUp strokeWidth={1.5} className="size-3.5" />
                  {card.badge}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-foreground inline-flex items-center gap-2 text-[15px] font-medium">
                <span>{card.trendTitle}</span>
                {card.showTrendIcon && (
                  <TrendingUp strokeWidth={1.5} className="size-3.5 shrink-0" />
                )}
              </p>
              <p className="text-muted-foreground text-[15px] leading-snug font-normal">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </dl>

      {/* Main Engagement Area Chart Card (Figma 678:20603) */}
      <section className="bg-card border-border shadow-steady-card flex flex-col gap-5 rounded-[20px] border p-[21px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-foreground text-[15px] font-medium">
              Site Visitors
            </h2>
            <p className="text-muted-foreground text-[15px] font-normal">
              {stats.isLoading
                ? "Daily engagement trends across university colleges"
                : stats.isError
                  ? "Unable to load engagement trends"
                  : `Daily engagement trends across university colleges • ${total.toLocaleString()} in ${RANGES[range].toLowerCase()}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PillTabs
              ariaLabel="Dashboard chart metric"
              value={metric}
              onChange={(next) => setMetric(next as ChartMetric)}
              options={Object.entries(METRICS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <Select value={range} onValueChange={(v) => setRange(v as Range)}>
              <SelectTrigger aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time Range</SelectLabel>
                  {Object.entries(RANGES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {stats.isLoading ? (
          <Skeleton className="h-[340px] w-full rounded-[15px]" />
        ) : stats.isError ? (
          <ErrorState
            title="The dashboard couldn't be loaded"
            onRetry={() => stats.refetch()}
            className="h-[340px]"
          />
        ) : total === 0 ? (
          <EmptyState
            icon={ChartNoAxesColumn}
            title="No activity in this range"
            description="Try a longer date range or another metric."
            className="h-[340px]"
          />
        ) : (
          <DashboardChart
            data={series}
            metric={metric}
            label={METRICS[metric]}
          />
        )}
      </section>

      {/* Bottom 2-Column Executive Breakdown (Figma 678:20644) */}
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Left: Caseload Distribution by Academic College (Figma 678:20645) */}
        <section className="bg-card border-border shadow-steady-card flex flex-col gap-6 rounded-[20px] border p-[21px]">
          <div className="space-y-1">
            <h2 className="text-foreground text-[15px] font-medium">
              Caseload Distribution by Academic College
            </h2>
            <p className="text-muted-foreground text-[15px] font-normal">
              Where student consultation demand originates
            </p>
          </div>

          {collegeCaseload.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-[15px]">
              No academic college caseload data recorded yet.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {collegeCaseload.map((item) => {
                const widthPct = Math.max(
                  10,
                  Math.round((item.count / maxCollegeCount) * 86),
                );
                return (
                  <div key={item.college} className="space-y-1.5">
                    <p className="text-foreground text-[15px] font-normal">
                      {item.college}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div
                        className="bg-primary h-[44px] rounded-[10px] shadow-[inset_4px_4px_8.1px_0px_rgba(255,255,255,0.45)] transition-[width] duration-300"
                        style={{ width: `${widthPct}%` }}
                      />
                      <span className="text-muted-foreground shrink-0 text-[15px] tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Counselor Capacity & Status (Figma 678:20680) */}
        <section className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-5 rounded-[20px] border p-[21px]">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <h2 className="text-foreground text-[15px] font-medium">
                Counselor Capacity &amp; Status
              </h2>
              <p className="text-muted-foreground text-[15px] font-normal">
                Active clinical caseload vs weekly limits
              </p>
            </div>

            {visibleCounselors.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-[15px]">
                No registered guidance counselors found.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {visibleCounselors.map((counselor) => (
                  <button
                    key={counselor.id}
                    type="button"
                    onClick={() => setEditingCounselor(counselor.counselor)}
                    className="bg-card border-border hover:bg-muted/50 shadow-steady-card flex w-full cursor-pointer items-center justify-between gap-4 rounded-[20px] border p-[15px] text-left transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <UserAvatar
                        name={counselor.name}
                        src={counselor.avatarUrl ?? undefined}
                        className="size-[51px] shrink-0 rounded-[10px]"
                      />
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-[15px] font-medium">
                          {counselor.name}
                        </p>
                        <p className="text-muted-foreground truncate text-[15px] font-normal">
                          {counselor.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <p className="text-foreground text-[15px] font-normal whitespace-nowrap tabular-nums">
                        {counselor.activeClients} Active Clients
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center justify-center rounded-[35px] px-2.5 py-1 text-[14px] leading-none font-normal",
                          CAPACITY_BADGE_STYLES[counselor.status],
                        )}
                      >
                        {counselor.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-muted-foreground text-[15px]">
              View {visibleCounselors.length} out of {counselorCapacity.length}{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={safeCounselorPage <= 0}
                onClick={() => setCounselorPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={safeCounselorPage + 1 >= counselorPageCount}
                onClick={() =>
                  setCounselorPage((p) =>
                    Math.min(counselorPageCount - 1, p + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>

      {editingCounselor && (
        <CounselorEditDialog
          counselor={editingCounselor}
          onClose={() => setEditingCounselor(null)}
        />
      )}
    </div>
  );
}
