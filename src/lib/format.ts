export function strToTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}

// Date and Time parsing shit, for Supabase and NextJS compatibility
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

/** An appointment instant in the office timezone, e.g. "Mon, Sep 14, 2026, 9:30 AM". */
export function formatAppointmentDate(iso: string | null | undefined): string {
  if (!iso) return "No schedule";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A date range for an event, collapsing the second date when it is the same day. */
export function formatEventRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = (d: Date) =>
    d.toLocaleDateString("en-US", {
      timeZone: APP_TIMEZONE,
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  const time = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      timeZone: APP_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
    });

  return day(start) === day(end)
    ? `${day(start)}, ${time(start)} – ${time(end)}`
    : `${day(start)} – ${day(end)}`;
}

/** "08:00:00" as "8:00 AM". Tolerates a timezone suffix. */
export function formatClockTime(value: string | null | undefined): string {
  if (!value) return "";
  const [hours, minutes = "00"] = value.split(/[+-]/)[0].split(":");
  const hour = Number(hours);
  if (Number.isNaN(hour)) return value;
  return `${hour % 12 || 12}:${minutes.padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

/**
 * An instant as the value of a `datetime-local` input, in office time.
 *
 * The old picker used the browser's timezone and `hour12: false`, which renders
 * midnight as "24:00" in some locales, a value the time input rejects.
 */
export function toOfficeInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** The inverse: a `datetime-local` value typed in office time, as an ISO instant. */
export function fromOfficeInputValue(value: string): string {
  if (!value) return "";
  // Manila has no daylight saving, so its offset is fixed.
  const date = new Date(`${value}:00+08:00`);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
