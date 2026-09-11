import type { Database } from "@/types/supabase";

/**
 * The one description of appointment status.
 *
 * These five values used to be loose strings scattered across eight files, and the
 * presentation disagreed between areas: the admin table painted `approved` blue and
 * `completed` green while the counselor view painted them the other way round. The
 * database now stores an enum, and everything that renders or filters a status
 * reads it from here.
 */
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status"];

export const APPOINTMENT_STATUSES = [
  "pending",
  "approved",
  "completed",
  "cancelled",
  "rejected",
] as const satisfies readonly AppointmentStatus[];

export function isAppointmentStatus(
  value: unknown,
): value is AppointmentStatus {
  return (
    typeof value === "string" &&
    (APPOINTMENT_STATUSES as readonly string[]).includes(value)
  );
}

/** Narrows an unknown status to the enum, or undefined for "no filter". */
export function toAppointmentStatus(
  value: unknown,
): AppointmentStatus | undefined {
  return isAppointmentStatus(value) ? value : undefined;
}

type StatusPresentation = {
  /** Sentence-case text for tables, tiles and filter chips. */
  label: string;
  /** Solid background, for the small dot beside a row. */
  dot: string;
  /** Background and text pair, for a filled badge. */
  badge: string;
  /** What the state means, for a tooltip or an empty-state line. */
  description: string;
};

export const APPOINTMENT_STATUS_PRESENTATION: Record<
  AppointmentStatus,
  StatusPresentation
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-900",
    description: "Waiting for the counselor to respond.",
  },
  approved: {
    label: "Approved",
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-900",
    description: "Confirmed and on the calendar.",
  },
  completed: {
    label: "Completed",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-900",
    description: "The session has taken place.",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-800",
    description: "Called off by the student.",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-900",
    description: "Declined by the counselor.",
  },
};

/** Statuses that still hold a slot on the counselor's calendar. */
export const ACTIVE_APPOINTMENT_STATUSES = [
  "pending",
  "approved",
] as const satisfies readonly AppointmentStatus[];

export function appointmentStatusLabel(value: unknown): string {
  return isAppointmentStatus(value)
    ? APPOINTMENT_STATUS_PRESENTATION[value].label
    : "Unknown";
}

export function appointmentStatusDot(value: unknown): string {
  return isAppointmentStatus(value)
    ? APPOINTMENT_STATUS_PRESENTATION[value].dot
    : "bg-gray-300";
}

export function appointmentStatusBadge(value: unknown): string {
  return isAppointmentStatus(value)
    ? APPOINTMENT_STATUS_PRESENTATION[value].badge
    : "bg-gray-100 text-gray-800";
}
