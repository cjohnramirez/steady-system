import { format } from "date-fns";

export function generateRange(max: number, step: number) {
  if (step <= 0) step = 1; // Ensure step is at least 1 to avoid infinite loop
  const arr = [];
  for (let i = step; i <= max; i += step) {
    arr.push(i);
  }
  return arr;
}

export function dateToString(dateString?: string): string {
  if (!dateString) return "No schedule";
  return new Date(dateString).toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function strToTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}

// Date and Time parsing shit, for Supabase and NextJS compatibility
export function generateTimeSlots(
  startTime: string,
  endTime: string,
): string[] {
  // Parse time format "HH:MM:SS+TZ" or "HH:MM:SS" to "HH:MM"
  const parseTimeString = (timeStr: string): [number, number] => {
    const timePart = timeStr.includes("+")
      ? timeStr.split("+")[0]
      : timeStr.includes("-")
        ? timeStr.split("-")[0]
        : timeStr;
    const parts = timePart.split(":");
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return [h, m];
  };

  const [startHour, startMinute] = parseTimeString(startTime);
  const [endHour, endMinute] = parseTimeString(endTime);

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

export function ampmTo24(time: string): string {
  const [h, m] = time.match(/\d+/g)!.map(Number);
  const isPM = time.toUpperCase().includes("PM");
  const hour = (h % 12) + (isPM ? 12 : 0);
  return `${hour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
}

export function toAMPM(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function extractPublicId(url: string) {
  const regex = /\/v\d+\/([^?]+)/;
  const match = url.match(regex);

  return match ? match[1] : null;
}

/**
 * The guidance office runs on one wall clock, and so does the database function
 * that generates bookable slots. Every conversion between a calendar day, a time
 * of day and an instant goes through here so the two cannot disagree.
 */
export const APP_TIMEZONE = "Asia/Manila";

/** A slot instant rendered as a local time, for example "8:30 AM". */
export function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * The calendar day a Date falls on in the office's timezone, as YYYY-MM-DD.
 *
 * Using toISOString() here would be wrong: it converts to UTC first, so an
 * evening appointment in Manila reports the following day.
 */
export function toAppDateString(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
