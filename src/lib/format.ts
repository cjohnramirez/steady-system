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
