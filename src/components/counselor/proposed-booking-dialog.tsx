"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
import { createManualBooking } from "@/lib/actions/clinical";
import { cn } from "@/lib/utils";

export interface BookingStudentOption {
  id: string;
  name: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const TIME_SLOTS = [
  "08:30 AM",
  "09:30 AM",
  "10:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
] as const;
const DURATIONS = [30, 45, 60] as const;

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

function toIsoSlot(date: Date, timeLabel: string): string {
  const [time, meridiem] = timeLabel.split(" ");
  const [hStr, mStr] = time.split(":");
  let hours = Number(hStr);
  const minutes = Number(mStr);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  const combined = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
  );
  return combined.toISOString();
}

export function ProposedBookingDialog({
  open,
  onOpenChange,
  counselorName,
  students,
  previewOnly = false,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counselorName: string;
  students: BookingStudentOption[];
  previewOnly?: boolean;
  onSuccess?: () => void;
}) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [timeSlot, setTimeSlot] = useState<string>("10:30 AM");
  const [duration, setDuration] = useState<string>("30");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const cells = getMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  const monthTitle = viewDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selectedLabel = selectedDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  }

  function handleSave() {
    if (!studentId) {
      toast.error("Select a student first");
      return;
    }

    if (previewOnly) {
      toast.success(
        `Proposed booking saved for ${selectedLabel} at ${timeSlot} (preview)`,
      );
      onSuccess?.();
      onOpenChange(false);
      return;
    }

    startTransition(async () => {
      const res = await createManualBooking({
        student_id: studentId,
        scheduled_at: toIsoSlot(selectedDate, timeSlot),
        duration_minutes: Number(duration),
        urgency: "low",
        reason: note.trim() || "Counselor-proposed follow-up session",
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Proposed booking sent to student");
      setNote("");
      onSuccess?.();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[588px]">
        {/* Static Gray Header Band (Figma 678:18531) */}
        <div className="bg-muted/60 border-border shrink-0 space-y-5 border-b p-5 pr-12 text-left">
          <div className="space-y-1">
            <DialogTitle className="text-[15px] font-medium">
              Propose a Booking Time
            </DialogTitle>
            <DialogDescription className="text-foreground/80 text-[15px] leading-snug">
              Pick an open slot from your calendar. We&apos;ll send an update
              email to the student with one-click confirmation.
            </DialogDescription>
          </div>

          {/* Student -> Counselor Pill Row (Figma 678:18536) */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <span className="block text-[14px] font-medium">Student</span>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="min-w-44">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Student</SelectLabel>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <ArrowRight
              aria-hidden
              className="text-muted-foreground mb-3.5 size-5 shrink-0"
            />

            <div className="space-y-1.5">
              <span className="block text-[14px] font-medium">Counselor</span>
              <div className="bg-card border-border shadow-steady-card flex h-12 items-center rounded-[25px] border px-5 text-[15px]">
                {counselorName}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Center White Body (Figma 678:18553) */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="space-y-1 text-left">
            <p className="text-[15px] font-medium">Select Date and Time</p>
            <p className="text-foreground/80 text-[15px]">
              Based on your availability. You can edit it{" "}
              <Link
                href="/counselor/availability"
                onClick={() => onOpenChange(false)}
                className="underline underline-offset-2"
              >
                here
              </Link>
              .
            </p>
          </div>

          {/* Side-by-Side Calendar + Time/Duration Card (Figma 678:18559) */}
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_230px]">
            {/* Calendar Card */}
            <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-3 rounded-[20px] border p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => shiftMonth(-1)}
                  className="border-border hover:bg-muted flex size-[40px] items-center justify-center rounded-full border transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[14px] font-medium">{monthTitle}</span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => shiftMonth(1)}
                  className="border-border hover:bg-muted flex size-[40px] items-center justify-center rounded-full border transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground grid grid-cols-7 text-center text-[13px]">
                  {WEEKDAYS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {cells.map(({ date, inMonth }) => {
                    const isSelected =
                      date.toDateString() === selectedDate.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "mx-auto flex size-[36px] items-center justify-center rounded-[10px] text-[14px] transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-steady-pill"
                            : inMonth
                              ? "text-foreground hover:bg-muted"
                              : "text-muted-foreground/50 hover:bg-muted/60",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Slot Summary & Dropdowns Card (Figma 678:18667) */}
            <div className="bg-card border-border shadow-steady-card flex flex-col justify-between gap-4 rounded-[20px] border p-5 text-left">
              <div className="space-y-1">
                <p className="text-[14px] font-medium">Appointment Date</p>
                <p className="text-foreground/85 text-[15px]">
                  {selectedLabel}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[14px] font-medium">
                  Appointment Time
                </span>
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Time</SelectLabel>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[14px] font-medium">
                  Appointment Duration
                </span>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Duration</SelectLabel>
                      {DURATIONS.map((mins) => (
                        <SelectItem key={mins} value={String(mins)}>
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

          {/* Optional Counselor Note (Figma 678:18682) */}
          <div className="bg-card border-border shadow-steady-card rounded-[20px] border p-5">
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional. Type some counselor note here for the student."
              className="w-full resize-y bg-transparent text-[15px] outline-none"
            />
          </div>
        </div>

        {/* Static Gray Footer Band (Figma 678:18687) */}
        <div className="bg-muted/60 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button type="button" loading={isPending} onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
