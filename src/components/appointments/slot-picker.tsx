"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { CalendarX } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClient } from "@/utils/supabase/client";
import { fetchAvailableSlots } from "@/lib/appointments/queries";
import { formatSlotTime, toAppDateString } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

type Counselor = { id: string; day_of_week: boolean[] | null };

/**
 * Pick a day, then one of the counselor's free half-hour slots on it.
 *
 * Shared by booking and rescheduling. Slots come from get_available_slots, so a
 * time someone else holds is never offered. When rescheduling, the slot the
 * appointment already holds is added back so the current time stays visible.
 *
 * The calendar hands back the local calendar day the user clicked, so both the
 * weekday check and the day sent to the database use that day's own components.
 */
export function SlotPicker({
  counselor,
  value,
  onChange,
  heldSlot,
  className,
}: {
  counselor: Counselor;
  value: string;
  onChange: (iso: string) => void;
  heldSlot?: string | null;
  className?: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [day, setDay] = useState<Date | undefined>(() =>
    heldSlot ? calendarDayOf(heldSlot) : undefined,
  );
  const dayKey = day ? format(day, "yyyy-MM-dd") : "";

  const slots = useQuery({
    queryKey: queryKeys.availableSlots.day(counselor.id, dayKey),
    queryFn: () => fetchAvailableSlots(supabase, counselor.id, dayKey),
    enabled: Boolean(dayKey),
    staleTime: 30 * 1000,
  });

  const options = useMemo(() => {
    const list = slots.data ?? [];
    const sameDay = heldSlot && toAppDateString(new Date(heldSlot)) === dayKey;
    const normalized = list.map((slot) => new Date(slot).toISOString());
    if (sameDay && !normalized.includes(new Date(heldSlot).toISOString())) {
      return [new Date(heldSlot).toISOString(), ...normalized].sort();
    }
    return normalized;
  }, [slots.data, heldSlot, dayKey]);

  const todayKey = toAppDateString(new Date());
  const disabled = (date: Date) => {
    if (format(date, "yyyy-MM-dd") < todayKey) return true;
    const days = counselor.day_of_week;
    return !days || days.length < 7 || !days[date.getDay()];
  };

  return (
    <div className={cn("grid gap-6 md:grid-cols-[auto_1fr]", className)}>
      <Calendar
        mode="single"
        selected={day}
        defaultMonth={day}
        onSelect={(next) => {
          setDay(next);
          onChange("");
        }}
        disabled={disabled}
        className="bg-card mx-auto rounded-xl border md:mx-0"
      />
      <div className="flex min-w-0 flex-col gap-3">
        <p className="font-medium" id="slot-label">
          {day
            ? `Available times on ${format(day, "EEEE, MMMM d")}`
            : "Pick a day to see available times"}
        </p>
        {!day ? (
          <p className="text-muted-foreground">
            Days the counselor does not work are greyed out.
          </p>
        ) : slots.isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-9" />
            ))}
          </div>
        ) : options.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-3 rounded-xl border border-dashed p-4">
            <CalendarX
              aria-hidden
              strokeWidth={1.25}
              className="size-5 shrink-0"
            />
            <p>No free times left on this day. Try another date.</p>
          </div>
        ) : (
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={2}
            value={value}
            onValueChange={(next) => next && onChange(next)}
            aria-labelledby="slot-label"
            className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {options.map((slot) => (
              <ToggleGroupItem
                key={slot}
                value={slot}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {formatSlotTime(slot)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>
    </div>
  );
}

/** The calendar day (in the office timezone) an instant falls on, as a local Date. */
function calendarDayOf(iso: string) {
  const [year, month, date] = toAppDateString(new Date(iso))
    .split("-")
    .map(Number);
  return new Date(year, month - 1, date);
}
