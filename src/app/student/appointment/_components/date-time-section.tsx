import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startTransition, useEffect, useState } from "react";
import { CalendarCheck, Clock, Info } from "lucide-react";
import { dateToString, generateTimeSlots, toAMPM, ampmTo24 } from "@/lib/format";
import { Tables } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";
import { getBookedTimeSlots } from "../actions";
import { createClient } from "@/utils/supabase/client";

function getCalendarDisabledDays(
  counselorData: Tables<"counselor_with_details"> | null,
) {
  if (!counselorData) return;

  return (date: Date): boolean => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }
    const dayIndex = date.getDay();
    const isAvailable =
      counselorData && counselorData.day_of_week
        ? counselorData.day_of_week[dayIndex]
        : [];
    const isDisabled = !isAvailable;
    return isDisabled;
  };
}

function isTimeSlotBooked(timeSlot: string, bookedTimes: string[]): boolean {
  return bookedTimes.some((bookedTime) => {
    const bookedDate = new Date(bookedTime);
    const hours = String(bookedDate.getHours()).padStart(2, "0");
    const minutes = String(bookedDate.getMinutes()).padStart(2, "0");
    const bookedAMPM = toAMPM(`${hours}:${minutes}`);
    return bookedAMPM === timeSlot;
  });
}

function isTimeSlotPast(timeSlot: string, selectedDate: Date | null): boolean {
  if (!selectedDate) return false;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  
  // If selected date is in the future, no slots are past
  if (selected > today) return false;
  
  // If selected date is today, check if slot time has passed
  if (selected.getTime() === today.getTime()) {
    const time24 = ampmTo24(timeSlot);
    const [h, m] = time24.split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(h, m, 0, 0);
    return slotDate <= now;
  }
  
  return false;
}

export default function DateTimeSection({
  counselorData,
  date,
  setDate,
  isLoading,
  setIsTimeSelected,
  setIsTimeResetted,
  isRescheduleModal = false,
  appointmentData,
}: {
  counselorData: Tables<"counselor_with_details"> | null;
  date: Date | null;
  setDate: (newDate: Date | null) => void;
  isLoading: boolean;
  setIsTimeSelected?: (isTimeSelected: boolean) => void;
  setIsTimeResetted?: (isTimeSelected: boolean) => void;
  isRescheduleModal?: boolean;
  appointmentData?: Tables<"appointment_with_details">;
}) {
  const supabase = createClient();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentData?.scheduled_at) return;
    const scheduledDate = new Date(appointmentData.scheduled_at!);

    startTransition(() => {
      setDate(scheduledDate);

      const hours = String(scheduledDate.getHours()).padStart(2, "0");
      const minutes = String(scheduledDate.getMinutes()).padStart(2, "0");
      const timeString = toAMPM(`${hours}:${minutes}:00`);

      setSelectedTime(timeString);
    });
  }, [appointmentData, setDate]);

  const timeSlots = counselorData
    ? generateTimeSlots(
        counselorData.start_time ?? "",
        counselorData.end_time ?? "",
      )
    : [];

  const handleDateSelect = (date: Date) => {
    setDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (setIsTimeSelected) setIsTimeSelected(true);
    setSelectedTime(time);
    if (!date) return;
    
    if (setIsTimeResetted) setIsTimeResetted(true);
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return;

    const [, hour, minute, period] = match;
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;

    const newDate = new Date(date);
    newDate.setHours(h, m, 0, 0);

    setDate(newDate);
  };

  const { data: bookedTimeSlots = [] } = useQuery({
    queryKey: [
      "bookedTimeSlots",
      counselorData?.id,
      dateToString(date?.toISOString() || ""),
    ],
    queryFn: () =>
      getBookedTimeSlots(
        supabase,
        counselorData?.id || "",
        dateToString(date?.toISOString() || ""),
      ),
    enabled: !!counselorData?.id && !!date,
  });

  console.log(bookedTimeSlots);

  return (
    <div className="w-full rounded-2xl border bg-white p-8">
      <p className="font-medium">Select Date and Time</p>
      <div className="mt-5 flex w-full gap-4">
        <Calendar
          mode="single"
          defaultMonth={date || undefined}
          selected={date || undefined}
          onSelect={handleDateSelect}
          disabled={getCalendarDisabledDays(counselorData) || isLoading}
          className="w-1/2 rounded-lg border"
          required
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
                  value={selectedTime ?? ""}
                  onValueChange={handleTimeSelect}
                  disabled={!counselorData || timeSlots.length === 0 || !date}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => {
                      const isBooked = isTimeSlotBooked(slot, bookedTimeSlots);
                      const isPast = isTimeSlotPast(slot, date);
                      const isDisabled = isBooked || isPast;
                      return (
                        <SelectItem
                          key={slot}
                          value={slot}
                          disabled={isDisabled}
                          className={isDisabled ? "text-gray-400" : ""}
                        >
                          {slot}
                          {isBooked && " (Booked)"}
                          {isPast && !isBooked && " (Past)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
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
                <p>
                  Availability depends on the counselor and is subject to change
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
