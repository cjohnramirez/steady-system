"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { bookAppointment, cancelAppointment } from "@/lib/appointments/actions";
import { fetchAvailableSlots } from "@/lib/appointments/queries";
import { formatSlotTime, toAppDateString } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const DURATIONS = ["30", "45", "60"] as const;

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - firstDay - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), inMonth: false });
  }
  return cells;
}

function findNextAvailableDate(dayOfWeek: boolean[] | null | undefined): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!dayOfWeek || dayOfWeek.length < 7) return today;

  for (let offset = 0; offset < 30; offset++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    if (dayOfWeek[candidate.getDay()]) return candidate;
  }
  return today;
}

export interface RescheduleSessionTarget {
  appointmentId: string;
  appointmentStatus: string;
  reason: string;
  studentName: string;
  counselorId: string;
  counselorName: string;
  counselorDays?: boolean[] | null;
}

/**
 * Figma Reschedule Dialog (678:20278):
 * Propose a Rescheduled Booking Time with Student <-> Counselor pills,
 * side-by-side Calendar & Rescheduled Date/Time/Duration card, and Figma Textarea.
 */
export function RescheduleSessionDialog({
  open,
  onOpenChange,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: RescheduleSessionTarget | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const [viewDate, setViewDate] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState("");
  const [duration, setDuration] = useState("30");
  const [reasonNote, setReasonNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const effectiveDate = useMemo(
    () =>
      selectedDate ??
      (target ? findNextAvailableDate(target.counselorDays) : new Date()),
    [selectedDate, target],
  );

  const effectiveViewDate = useMemo(
    () =>
      viewDate ??
      new Date(effectiveDate.getFullYear(), effectiveDate.getMonth(), 1),
    [viewDate, effectiveDate],
  );

  const dayKey = format(effectiveDate, "yyyy-MM-dd");
  const slotsQuery = useQuery({
    queryKey: queryKeys.availableSlots.day(target?.counselorId ?? "", dayKey),
    queryFn: () => fetchAvailableSlots(supabase, target!.counselorId, dayKey),
    enabled: Boolean(open && target?.counselorId && dayKey),
    staleTime: 30 * 1000,
  });

  const availableSlots = useMemo(
    () => (slotsQuery.data ?? []).map((s) => new Date(s).toISOString()),
    [slotsQuery.data],
  );

  const effectiveSlot =
    slot && availableSlots.includes(slot) ? slot : (availableSlots[0] ?? "");

  if (!target) return null;

  const todayKey = toAppDateString(new Date());
  const isDateDisabled = (date: Date) => {
    if (format(date, "yyyy-MM-dd") < todayKey) return true;
    const days = target.counselorDays;
    if (!days || days.length < 7) return false;
    return !days[date.getDay()];
  };

  const monthCells = getMonthGrid(
    effectiveViewDate.getFullYear(),
    effectiveViewDate.getMonth(),
  );
  const monthTitle = effectiveViewDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selectedLabel = format(effectiveDate, "MMMM d, yyyy");

  function shiftMonth(delta: number) {
    setViewDate(
      new Date(
        effectiveViewDate.getFullYear(),
        effectiveViewDate.getMonth() + delta,
        1,
      ),
    );
  }

  function handleSave() {
    if (!target) return;
    if (!effectiveSlot) {
      toast.error("Select an available time slot first.");
      return;
    }

    startTransition(async () => {
      // Book the new proposed slot and cancel the prior pending/approved slot if applicable
      const booked = await bookAppointment({
        counselor_id: target.counselorId,
        scheduled_at: effectiveSlot,
        reason: target.reason || "Rescheduled Consultation",
        notes: reasonNote.trim(),
        duration_minutes: Number(duration),
      });

      if (!booked.ok) {
        toast.error(booked.error);
        return;
      }

      if (
        target.appointmentStatus === "pending" ||
        target.appointmentStatus === "approved"
      ) {
        await cancelAppointment(target.appointmentId);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.appointments.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.availableSlots.all,
        }),
      ]);

      toast.success("Rescheduled booking request sent to your counselor.");
      setReasonNote("");
      setSlot("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band (Figma 678:20279) */}
        <div className="bg-muted/60 border-border shrink-0 space-y-5 border-b p-5 pr-12 text-left">
          <div className="space-y-1">
            <DialogTitle className="text-[15px] font-medium">
              Propose a Rescheduled Booking Time
            </DialogTitle>
            <DialogDescription className="text-foreground/80 text-[15px] leading-snug">
              Pick an open slot from your counselor&apos;s calendar. We&apos;ll
              send an update once confirmed.
            </DialogDescription>
          </div>

          {/* Student <-> Counselor Pill Row (Figma 678:20284) */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <span className="text-foreground block text-[14px] font-medium">
                Student
              </span>
              <div className="bg-card border-border shadow-steady-card flex h-12 items-center rounded-[25px] border px-5 text-[15px]">
                {target.studentName}
              </div>
            </div>

            <ArrowLeftRight
              aria-hidden
              strokeWidth={1.5}
              className="text-muted-foreground mb-3.5 size-5 shrink-0"
            />

            <div className="space-y-1.5">
              <span className="text-foreground block text-[14px] font-medium">
                Counselor
              </span>
              <div className="bg-card border-border shadow-steady-card flex h-12 items-center rounded-[25px] border px-5 text-[15px]">
                {target.counselorName}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Center White Body (Figma 678:20300) */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="space-y-1 text-left">
            <p className="text-[15px] font-medium">Select Date and Time</p>
            <p className="text-foreground/80 text-[15px]">
              The available time is based on the counselor&apos;s availability.
            </p>
          </div>

          {/* Side-by-Side Calendar + Rescheduled Details Card */}
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_225px]">
            {/* Calendar Card */}
            <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-3 rounded-[20px] border p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                  className="border-border hover:bg-muted flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors"
                >
                  <ChevronLeft strokeWidth={1.5} className="size-4" />
                </button>
                <span className="text-[14px] font-medium">{monthTitle}</span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => shiftMonth(1)}
                  className="border-border hover:bg-muted flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors"
                >
                  <ChevronRight strokeWidth={1.5} className="size-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground grid grid-cols-7 text-center text-[13px]">
                  {WEEKDAYS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {monthCells.map(({ date, inMonth }) => {
                    const disabled = isDateDisabled(date);
                    const isSelected =
                      date.toDateString() === effectiveDate.toDateString();

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(date);
                          setSlot("");
                        }}
                        className={cn(
                          "mx-auto flex size-[36px] items-center justify-center rounded-[10px] text-[14px] transition-colors",
                          isSelected &&
                            "bg-primary text-primary-foreground shadow-steady-pill font-medium",
                          !isSelected &&
                            !disabled &&
                            inMonth &&
                            "text-foreground hover:bg-muted cursor-pointer",
                          !isSelected &&
                            !disabled &&
                            !inMonth &&
                            "text-muted-foreground/50 hover:bg-muted/60 cursor-pointer",
                          disabled &&
                            "text-muted-foreground/30 cursor-not-allowed",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Rescheduled Details Card */}
            <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-4 rounded-[20px] border p-5 text-left">
              <div className="space-y-1">
                <p className="text-[14px] font-medium">Rescheduled Date</p>
                <p className="text-foreground/85 text-[15px]">
                  {selectedLabel}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[14px] font-medium">
                  Rescheduled Time
                </span>
                {slotsQuery.isLoading ? (
                  <Skeleton className="h-12 w-full rounded-[25px]" />
                ) : availableSlots.length === 0 ? (
                  <div className="border-border text-muted-foreground flex h-12 items-center rounded-[25px] border px-4 text-[14px]">
                    No Open Slots
                  </div>
                ) : (
                  <Select value={effectiveSlot} onValueChange={setSlot}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Times</SelectLabel>
                        {availableSlots.map((iso) => (
                          <SelectItem key={iso} value={iso}>
                            {formatSlotTime(iso)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="block text-[14px] font-medium">
                  Rescheduled Duration
                </span>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Duration</SelectLabel>
                      {DURATIONS.map((mins) => (
                        <SelectItem key={mins} value={mins}>
                          {mins} mins
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-muted-foreground text-[14px] leading-snug">
                These details can be changed anytime.
              </p>
            </div>
          </div>

          {/* Optional Reason for Reschedule (Figma 578:2648 Textarea) */}
          <Textarea
            rows={2}
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder="Optional. Type reasons for reschedule here."
          />
        </div>

        {/* Static Gray Footer Band */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            loading={isPending}
            disabled={!effectiveSlot}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
