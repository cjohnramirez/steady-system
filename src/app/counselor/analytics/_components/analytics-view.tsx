"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AnalyticsSummaryProps {
  attendancePct: number;
  avgWaitDays: number;
  completedCount: number;
  topConcerns: { label: string; count: number }[];
  departmentSplit: { code: string; count: number }[];
}

export function CounselorAnalyticsView({
  attendancePct,
  avgWaitDays,
  completedCount,
  topConcerns,
  departmentSplit,
}: AnalyticsSummaryProps) {
  const [range, setRange] = useState("month");

  const maxConcern = Math.max(...topConcerns.map((c) => c.count), 1);
  const maxDept = Math.max(...departmentSplit.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Row (Figma 678:17952) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[22px] font-medium tracking-tight">
            Caseload Summary
          </h1>
          <p className="text-muted-foreground text-[15px]">
            Overview of student visits, most common student concerns, and
            session completion rates
          </p>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Timeframe</SelectLabel>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Main White Container (Figma 678:17952) */}
      <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
        {/* Top 3 KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border-border shadow-steady-card space-y-3 rounded-[20px] border p-5">
            <p className="text-foreground/85 text-[15px]">Session Attendance</p>
            <p className="text-[32px] leading-none font-medium tabular-nums">
              {attendancePct}%
            </p>
            <div className="space-y-0.5 text-xs">
              <p className="flex items-center gap-1.5 font-medium">
                <span>Trending up this period</span>
                <TrendingUp className="size-3.5" />
              </p>
              <p className="text-muted-foreground">
                Percentage of sessions attended
              </p>
            </div>
          </div>

          <div className="bg-card border-border shadow-steady-card space-y-3 rounded-[20px] border p-5">
            <p className="text-foreground/85 text-[15px]">
              Average Wait to Session
            </p>
            <p className="text-[32px] leading-none font-medium tabular-nums">
              {avgWaitDays} days
            </p>
            <div className="space-y-0.5 text-xs">
              <p className="font-medium">Remained stable in the past month</p>
              <p className="text-muted-foreground">
                Time needed to approve appointments
              </p>
            </div>
          </div>

          <div className="bg-card border-border shadow-steady-card space-y-3 rounded-[20px] border p-5">
            <p className="text-foreground/85 text-[15px]">
              Total Completed Sessions
            </p>
            <p className="text-[32px] leading-none font-medium tabular-nums">
              {completedCount}
            </p>
            <div className="space-y-0.5 text-xs">
              <p className="flex items-center gap-1.5 font-medium">
                <span>Trending up this period</span>
                <TrendingUp className="size-3.5" />
              </p>
              <p className="text-muted-foreground">
                Number of sessions completed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom 2-Column Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: Top Student Concern Categories (Horizontal Brand-Blue Bars) */}
          <div className="bg-card border-border shadow-steady-card space-y-5 rounded-[20px] border p-5">
            <div className="space-y-0.5">
              <h2 className="text-[16px] font-medium">
                Top Student Concern Categories
              </h2>
              <p className="text-muted-foreground text-sm">
                These are the recent trends that might be worth checking out
              </p>
            </div>

            <div className="space-y-4">
              {topConcerns.map((concern) => {
                const widthPct = Math.max(
                  14,
                  Math.round((concern.count / maxConcern) * 100),
                );
                return (
                  <div key={concern.label} className="space-y-1.5">
                    <p className="text-[14px]">{concern.label}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div
                          className="bg-primary shadow-steady-pill h-7 rounded-[12px] transition-[width] duration-300"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-7 text-right text-sm tabular-nums">
                        {concern.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Department Caseload Split (Vertical Brand-Blue Bars) */}
          <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-6 rounded-[20px] border p-5">
            <div className="space-y-0.5">
              <h2 className="text-[16px] font-medium">
                Department Caseload Split
              </h2>
              <p className="text-muted-foreground text-sm">
                These are the cases divided by their respective academic
                departments
              </p>
            </div>

            <div className="flex h-64 items-end justify-around gap-3 pt-4">
              {departmentSplit.map((dept) => {
                const heightPct = Math.max(
                  14,
                  Math.round((dept.count / maxDept) * 100),
                );
                return (
                  <div
                    key={dept.code}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {dept.count}
                    </span>
                    <div
                      className="bg-primary shadow-steady-pill w-full max-w-[36px] rounded-[12px] transition-[height] duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-foreground/85 truncate text-xs font-medium">
                      {dept.code}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
