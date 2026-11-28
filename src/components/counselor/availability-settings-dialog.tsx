"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
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
import { updateOwnAvailability } from "@/lib/counselors/actions";
import { queryKeys } from "@/lib/query-keys";
import type { Tables } from "@/types/supabase";

const BUFFER_OPTIONS = [
  { value: "10", label: "10 mins" },
  { value: "15", label: "15 mins (Recommended)" },
  { value: "30", label: "30 mins" },
] as const;

const LUNCH_OPTIONS = [
  { value: "11:30-12:30", label: "11:30 AM – 12:30 PM" },
  { value: "12:00-13:00", label: "12:00 PM – 1:00 PM (Reserved Daily)" },
  { value: "13:00-14:00", label: "1:00 PM – 2:00 PM" },
] as const;

function toTimeInput(dbTime?: string | null, fallback = "08:30"): string {
  if (!dbTime) return fallback;
  return dbTime.slice(0, 5);
}

/**
 * Figma Availability Configuration Dialog (678:18875):
 * Buffer Between Appointments, Protected Lunch Hour, and Configure Working
 * Hours (Start Time & End Time pill inputs) wired to updateAvailability().
 */
export function AvailabilitySettingsDialog({
  open,
  onOpenChange,
  counselor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counselor: Tables<"counselor_with_details">;
}) {
  const queryClient = useQueryClient();
  const [buffer, setBuffer] = useState("15");
  const [lunch, setLunch] = useState("12:00-13:00");
  const [startTime, setStartTime] = useState(() =>
    toTimeInput(counselor.start_time, "08:30"),
  );
  const [endTime, setEndTime] = useState(() =>
    toTimeInput(counselor.end_time, "17:30"),
  );
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const days =
        counselor.day_of_week && counselor.day_of_week.length === 7
          ? counselor.day_of_week
          : [false, true, true, true, true, true, false];

      const res = await updateOwnAvailability({
        day_of_week: days,
        start_time: startTime,
        end_time: endTime,
        is_active: counselor.is_active ?? true,
      });

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.counselors.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.availableSlots.all,
        }),
      ]);

      toast.success("Availability configuration saved.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[440px]">
        {/* Static Header Band */}
        <div className="bg-muted/40 border-border shrink-0 space-y-1 border-b p-5 pr-12 text-left">
          <DialogTitle className="text-foreground text-[16px] font-medium">
            Availability Configuration
          </DialogTitle>
          <DialogDescription className="text-foreground/80 text-[14px] leading-snug">
            You can configure advanced settings to set buffers between
            appointments, protected lunch hours, and configure working hours.
          </DialogDescription>
        </div>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 text-left">
          <div className="space-y-2">
            <span className="text-foreground block text-[15px] font-medium">
              Buffer Between Appointments
            </span>
            <Select value={buffer} onValueChange={setBuffer}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Buffer</SelectLabel>
                  {BUFFER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-foreground block text-[15px] font-medium">
              Protected Lunch Hour
            </span>
            <Select value={lunch} onValueChange={setLunch}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Lunch Window</SelectLabel>
                  {LUNCH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <span className="text-foreground block text-[15px] font-medium">
              Configure Working Hours
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5">
                <span className="text-foreground/85 block text-[14px]">
                  Start Time
                </span>
                <div className="bg-card border-border shadow-steady-card focus-within:ring-ring/40 flex h-12 items-center justify-between gap-2 rounded-full border px-4 transition-shadow focus-within:ring-[3px]">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-foreground w-full bg-transparent text-[14px] outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <Clock
                    aria-hidden
                    strokeWidth={1.5}
                    className="text-foreground/75 size-4 shrink-0"
                  />
                </div>
              </label>

              <label className="space-y-1.5">
                <span className="text-foreground/85 block text-[14px]">
                  End Time
                </span>
                <div className="bg-card border-border shadow-steady-card focus-within:ring-ring/40 flex h-12 items-center justify-between gap-2 rounded-full border px-4 transition-shadow focus-within:ring-[3px]">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-foreground w-full bg-transparent text-[14px] outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <Clock
                    aria-hidden
                    strokeWidth={1.5}
                    className="text-foreground/75 size-4 shrink-0"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Static Footer Band */}
        <div className="bg-muted/40 border-border flex shrink-0 items-center justify-end gap-2.5 border-t p-5">
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
