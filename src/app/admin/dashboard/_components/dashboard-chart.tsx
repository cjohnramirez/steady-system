"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DashboardPoint } from "@/lib/admin/dashboard";

export type ChartMetric = "visitors" | "logins" | "appointments";

/** Dates arrive as YYYY-MM-DD Manila days; parsed at noon so no timezone shifts the label. */
const label = (value: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-US", opts);

export default function DashboardChart({
  data,
  metric,
  label: seriesLabel,
}: {
  data: DashboardPoint[];
  metric: ChartMetric;
  label: string;
}) {
  const config = {
    [metric]: { label: seriesLabel, color: "var(--color-brand)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-[360px] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <defs>
          <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={`var(--color-${metric})`}
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor={`var(--color-${metric})`}
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={32}
          tickFormatter={(value: string) =>
            label(value, { month: "short", day: "numeric" })
          }
        />
        <YAxis
          width={40}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              labelFormatter={(value: string) =>
                label(value, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              }
            />
          }
        />
        <Area
          dataKey={metric}
          type="monotone"
          fill={`url(#fill-${metric})`}
          stroke={`var(--color-${metric})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
