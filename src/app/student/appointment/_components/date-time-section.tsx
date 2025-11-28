import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AppointmentCounselor } from "../page";
import { CalendarCheck, Clock, Info } from "lucide-react";
import { format } from "date-fns";

function getCalendarDisabledDays(counselorData: AppointmentCounselor | null) {
  if (!counselorData) return;

  return (date: Date): boolean => {
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }
    const dayIndex = date.getDay();
    const isAvailable = counselorData.dayOfWeek[dayIndex];
    const isDisabled = !isAvailable;
    return isDisabled;
  };
}

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  const slots: string[] = [];
  while (start < end) {
    slots.push(format(start, "h:mm a"));
    start.setMinutes(start.getMinutes() + 30);
  }
  return slots;
}

export default function DateTimeSection({
  counselorData,
  date,
  setDate,
  isLoading
}: {
  counselorData: AppointmentCounselor | null;
  date: Date | undefined;
  setDate: (newDate: Date | undefined) => void;
  isLoading: boolean
}) {
  const [selectedTime, setSelectedTime] = useState<string>("");

  const timeSlots = counselorData
    ? generateTimeSlots(counselorData.startTime, counselorData.endTime)
    : [];

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);

    if (date) {
      const [h, m] = time.match(/\d+/g)!.map(Number);
      const isPM = time.includes("PM");
      const hour = h % 12 + (isPM ? 12 : 0);

      const updatedDate = new Date(date);
      updatedDate.setHours(hour, m, 0, 0);
      setDate(updatedDate);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-8">
      <p className="font-medium">Select Date and Time</p>
      <div className="mt-5 flex w-full gap-4">
        <Calendar
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={setDate}
          disabled={getCalendarDisabledDays(counselorData) || isLoading}
          className="w-1/2 rounded-lg border-1"
        />
        <div className="flex w-full flex-col space-y-4">
          <div className="flex items-center gap-4 rounded-xl border-1 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border p-2">
              <CalendarCheck strokeWidth={1} size={40} />
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p>
                {date
                  ? date.toLocaleString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Please select a date"}
              </p>
            </div>
          </div>
          <div className="rounded-xl border-1 p-4">
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
              <p>
                Availability depends on the counselor and is subject to change
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
