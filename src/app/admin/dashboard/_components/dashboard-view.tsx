"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartNoAxesColumn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { SectionCard } from "@/components/app/section-card";
import { createClient } from "@/utils/supabase/client";
import { fetchDashboardStats, lastDays } from "@/lib/admin/dashboard";
import { queryKeys } from "@/lib/query-keys";
import DashboardChart, { type ChartMetric } from "./dashboard-chart";

const RANGES = {
  "90": "Last 3 months",
  "30": "Last 30 days",
  "7": "Last 7 days",
} as const;
type Range = keyof typeof RANGES;

const METRICS: Record<ChartMetric, string> = {
  visitors: "Site visitors",
  logins: "Logins",
  appointments: "Appointment requests",
};

export default function DashboardView() {
  const supabase = useMemo(() => createClient(), []);
  const [range, setRange] = useState<Range>("90");
  const [metric, setMetric] = useState<ChartMetric>("visitors");

  const stats = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => fetchDashboardStats(supabase),
    staleTime: 5 * 60 * 1000,
  });

  const s = stats.data;
  const cards = [
    {
      label: "Requests today",
      value: s?.appointments_today,
      hint: "Appointments created today",
    },
    {
      label: "Waiting for a counselor",
      value: s?.pending_appointments,
      hint: "Pending across all counselors",
    },
    {
      label: "Visitors, last 30 days",
      value: s?.visitors_30d,
      hint: "Counted once per browser per day",
    },
    {
      label: "Registered students",
      value: s?.students,
      hint: `${s?.counselors ?? "–"} counselors`,
    },
  ];

  const series = s ? lastDays(s.series, Number(range)) : [];
  const total = series.reduce((sum, point) => sum + point[metric], 0);

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-2xl border p-6">
            <dt className="text-muted-foreground">{card.label}</dt>
            <dd className="mt-2 text-4xl tracking-tight tabular-nums">
              {stats.isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : stats.isError ? (
                // A failed load must not read as a real zero.
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
            <p className="text-muted-foreground mt-2 text-xs">{card.hint}</p>
          </div>
        ))}
      </dl>

      <SectionCard
        title={METRICS[metric]}
        description={
          stats.isLoading
            ? "Loading…"
            : stats.isError
              ? "Unavailable"
              : `${total.toLocaleString()} in the ${RANGES[range].toLowerCase()}`
        }
        actions={
          <>
            <Tabs
              value={metric}
              onValueChange={(value) => setMetric(value as ChartMetric)}
            >
              <TabsList aria-label="Metric">
                {Object.entries(METRICS).map(([value, label]) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Tabs
              value={range}
              onValueChange={(value) => setRange(value as Range)}
            >
              <TabsList aria-label="Date range">
                {Object.entries(RANGES).map(([value, label]) => (
                  <TabsTrigger key={value} value={value}>
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </>
        }
      >
        {stats.isLoading ? (
          <Skeleton className="h-[360px] w-full rounded-xl" />
        ) : stats.isError ? (
          <ErrorState
            title="The dashboard couldn't be loaded"
            onRetry={() => stats.refetch()}
            className="h-[360px]"
          />
        ) : total === 0 ? (
          <EmptyState
            icon={ChartNoAxesColumn}
            title="No activity in this range"
            description="Try a longer date range or another metric."
            className="h-[360px]"
          />
        ) : (
          <DashboardChart
            data={series}
            metric={metric}
            label={METRICS[metric]}
          />
        )}
      </SectionCard>
    </div>
  );
}
