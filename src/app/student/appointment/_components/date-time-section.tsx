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
import { dateToString, generateTimeSlots, toAMPM } from "@/lib/format";
import { Tables } from "@/types/supabase";

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
  const [selectedTime, setSelectedTime] = useState<string>("");

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
    
    const handleTimeSelect = (time: string) => {
      setSelectedTime(time);
      if (!date) return;

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
          defaultMonth={date} // This ensures the calendar opens to the correct month
          selected={date}
          onSelect={setDate}
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
                  value={selectedTime}
                  onValueChange={handleTimeSelect}
                  disabled={!counselorData || timeSlots.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
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
