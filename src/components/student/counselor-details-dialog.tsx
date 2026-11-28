"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import { cn } from "@/lib/utils";

export interface CounselorProfileInfo {
  id: string;
  name: string;
  department: string;
  roleTitle?: string | null;
  email?: string | null;
  avatar?: string | null;
  officeRoom?: string | null;
  bio?: string | null;
  dutyStatus?: "available" | "in_session" | "writing_notes" | "off_duty" | null;
  officeHours?: string | null;
  /** 0 = Sunday .. 6 = Saturday */
  availableWeekdays?: number[];
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function CounselorDetailsDialog({
  open,
  onOpenChange,
  counselor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counselor: CounselorProfileInfo | null;
  showBookAction?: boolean;
}) {
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  if (!counselor) return null;

  const weekDates = getWeekDates(anchorDate);
  const availableDays = counselor.availableWeekdays ?? [2, 3, 5, 6];
  const monthLabel = anchorDate.toLocaleString("en-US", { month: "long" });
  const dayLabel = String(anchorDate.getDate());
  const yearLabel = String(anchorDate.getFullYear());

  function shiftWeek(deltaDays: number) {
    setAnchorDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + deltaDays);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[523px]">
        {/* Static Gray Header Band (Figma 678:20450) */}
        <div className="bg-muted/60 border-border shrink-0 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-[15px] font-medium">
            Counselor Details
          </DialogTitle>
          <DialogDescription className="sr-only">
            Profile, bio, office hours, and weekly availability for{" "}
            {counselor.name}
          </DialogDescription>
        </div>

        {/* Scrollable Center Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Section 1: 145px Avatar + Name/Title + 2 Pill Chips (Figma 678:20454) */}
          <div className="border-border border-b p-5">
            <div className="flex flex-col items-start gap-5 sm:flex-row">
              <UserAvatar
                name={counselor.name}
                src={counselor.avatar}
                className="size-[145px] shrink-0 rounded-[34px]"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 self-stretch">
                <div className="space-y-0.5 text-left">
                  <p className="text-[20px] leading-tight font-medium">
                    {counselor.name}
                  </p>
                  <p className="text-foreground/80 text-[15px]">
                    {counselor.roleTitle ?? counselor.department}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <span className="bg-card border-border shadow-steady-card inline-flex items-center gap-2.5 rounded-[35px] border px-3.5 py-2 text-[14px]">
                    <Clock strokeWidth={1.5} className="size-3.5 shrink-0" />
                    <span>
                      Office Hours on{" "}
                      {counselor.officeHours ?? "08:30 AM – 05:00 PM"}
                    </span>
                  </span>
                  <span className="bg-card border-border shadow-steady-card inline-flex items-center gap-2.5 rounded-[35px] border px-3.5 py-2 text-[14px]">
                    <MapPin strokeWidth={1.5} className="size-3.5 shrink-0" />
                    <span>{counselor.officeRoom ?? "West Hall Room 204"}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Bio and Focus Areas (Figma 678:20473) */}
          <div className="border-border space-y-1.5 border-b p-5 text-left">
            <p className="text-[15px] font-medium">Bio and Focus Areas</p>
            <p className="text-foreground/85 text-[15px] leading-snug">
              {counselor.bio ??
                "Licensed Guidance Counselor specializing in academic burnout recovery, situational stress, and undergraduate transition coaching."}
            </p>
          </div>

          {/* Section 3: Availability by Week (Figma 678:20477) */}
          <div className="space-y-4 p-5 text-left">
            <div className="space-y-1">
              <p className="text-[15px] font-medium">Availability by Week</p>
              <p className="text-muted-foreground text-[14px] leading-snug">
                Use the left and right buttons to navigate through the calendar.
                Dates filled in blue indicate days when the counselor is
                available.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous week"
                onClick={() => shiftWeek(-7)}
                className="border-border hover:bg-muted flex size-[46px] shrink-0 items-center justify-center rounded-full border transition-colors"
              >
                <ChevronLeft strokeWidth={1.5} className="size-4" />
              </button>

              <div className="bg-card border-border shadow-steady-card flex flex-1 flex-col items-center gap-3.5 rounded-[20px] border p-3.5">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="border-border rounded-[20px] border px-4 py-2 text-[14px]">
                    {monthLabel}
                  </span>
                  <span className="border-border rounded-[20px] border px-4 py-2 text-[14px]">
                    {dayLabel}
                  </span>
                  <span className="border-border rounded-[20px] border px-4 py-2 text-[14px]">
                    {yearLabel}
                  </span>
                </div>

                <div className="w-full space-y-1.5">
                  <div className="text-muted-foreground grid grid-cols-7 text-center text-[13px]">
                    {WEEKDAYS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDates.map((d) => {
                      const isAvailable = availableDays.includes(d.getDay());
                      const dayFull = d.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <div
                          key={d.toISOString()}
                          title={`${dayFull} — ${isAvailable ? "Available" : "Unavailable"}`}
                          aria-label={`${dayFull}, ${isAvailable ? "Available" : "Unavailable"}`}
                          className={cn(
                            "mx-auto flex size-[36px] items-center justify-center rounded-[10px] text-[14px] transition-colors",
                            isAvailable
                              ? "bg-primary text-primary-foreground shadow-steady-pill font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {d.getDate()}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Availability Color Legend */}
                <div className="border-border flex w-full items-center justify-center gap-5 border-t pt-2.5 text-[13px]">
                  <span className="text-foreground inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="bg-primary shadow-steady-pill size-3 rounded-[4px]"
                    />
                    Available
                  </span>
                  <span className="text-muted-foreground inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="bg-muted border-border size-3 rounded-[4px] border"
                    />
                    Unavailable
                  </span>
                </div>
              </div>

              <button
                type="button"
                aria-label="Next week"
                onClick={() => shiftWeek(7)}
                className="border-border hover:bg-muted flex size-[46px] shrink-0 items-center justify-center rounded-full border transition-colors"
              >
                <ChevronRight strokeWidth={1.5} className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Static Gray Footer Band (Figma 678:20531) */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end border-t p-5">
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
