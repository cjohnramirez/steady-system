"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CalendarCheck, Clock, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dateToString, formatSlotTime, toAppDateString } from "@/lib/format";
import { Tables } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { Spinner } from "@/components/ui/spinner";

function getCalendarDisabledDays(
  counselorData: Tables<"counselor_with_details"> | null,
) {
  if (!counselorData) return undefined;

  return (date: Date): boolean => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;

    const days = counselorData.day_of_week;
    if (!days || days.length < 7) return true;

    return !days[date.getDay()];
  };
}

export default function DateTimeSection({
  counselorData,
  date,
  setDate,
  isLoading,
  isRescheduleModal = false,
  appointmentData,
}: {
  counselorData: Tables<"counselor_with_details"> | null;
  date: Date | undefined;
  setDate: (newDate: Date | undefined) => void;
  isLoading: boolean;
  isRescheduleModal?: boolean;
  appointmentData?: Tables<"appointment_with_details">;
}) {
  const supabase = createClient();
  const [selectedSlot, setSelectedSlot] = useState<string>(
    appointmentData?.scheduled_at ?? "",
  );

  const counselorId = counselorData?.id ?? "";
  const day = date ? toAppDateString(date) : "";

  /**
   * Bookable instants come from the database rather than being generated here.
   *
   * This component used to build every half hour between the counselor's start
   * and end time and offer all of them, with no idea which were already taken.
   * Two students could pick the same minute with the same counselor and both
   * bookings were accepted.
   */
  const { data: slots = [], isLoading: isSlotsLoading } = useQuery({
    queryKey: queryKeys.availableSlots(counselorId, day),
    enabled: Boolean(counselorId && day),
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc("get_available_slots", {
        p_counselor_id: counselorId,
        p_day: day,
      });

      if (error) throw new Error(error.message);
      // Each row is one bookable instant, as a timestamptz string.
      return (data ?? []) as string[];
    },
  });

  // The slot the appointment being rescheduled already holds is not "available"
  // any more, so it is added back or the current time vanishes from the list.
  const options =
    appointmentData?.scheduled_at &&
    !slots.includes(appointmentData.scheduled_at)
      ? [appointmentData.scheduled_at, ...slots].sort()
      : slots;

  const handleTimeSelect = (iso: string) => {
    setSelectedSlot(iso);
    setDate(new Date(iso));
  };

  const handleDaySelect = (newDate: Date | undefined) => {
    setSelectedSlot("");
    setDate(newDate);
  };

  const busy = isLoading || isSlotsLoading;

  const placeholder = !date
    ? "Pick a date first"
    : isSlotsLoading
      ? "Checking availability"
      : options.length === 0
        ? "No times left on this day"
        : "Select a time slot";

  return (
    <div
      className={
        (isRescheduleModal ? "my-5" : "border border-gray-200 p-8") +
        " w-full rounded-2xl bg-white"
      }
    >
      <p className="font-medium">Select Date and Time</p>
      <div className="mt-5 flex w-full gap-4">
        <Calendar
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={handleDaySelect}
          disabled={getCalendarDisabledDays(counselorData) || isLoading}
          className="w-1/2 rounded-lg border"
        />
        <div className="flex w-full flex-col space-y-4">
          <div className="flex items-center gap-4 rounded-xl border p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border p-2">
              <CalendarCheck strokeWidth={1} size={40} />
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p>
                {date ? dateToString(date.toISOString()) : "No date selected"}
              </p>
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border p-2">
                <Clock strokeWidth={1} size={40} />
              </div>
              <div className="flex-1">
                <p className="mb-2 font-medium">Time</p>
                <Select
                  value={selectedSlot}
                  onValueChange={handleTimeSelect}
                  disabled={busy || options.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {formatSlotTime(slot)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isSlotsLoading && <Spinner />}
            </div>
          </div>
          <div className="flex gap-4 space-y-4 rounded-xl p-6">
            <div className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full border p-2">
              <Info strokeWidth={1} size={40} />
            </div>
            <div>
              <p className="font-medium">Note</p>
              {isRescheduleModal ? (
                <p>
                  You can change this anytime, and the student will be reminded
                </p>
              ) : (
                <p>Only times the counselor still has free are listed here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
