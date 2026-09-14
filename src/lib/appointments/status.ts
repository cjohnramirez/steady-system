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
    dot: "bg-status-pending-foreground",
    badge: "bg-status-pending text-status-pending-foreground",
    description: "Waiting for the counselor to respond.",
  },
  approved: {
    label: "Approved",
    dot: "bg-status-approved-foreground",
    badge: "bg-status-approved text-status-approved-foreground",
    description: "Confirmed and on the calendar.",
  },
  completed: {
    label: "Completed",
    dot: "bg-status-completed-foreground",
    badge: "bg-status-completed text-status-completed-foreground",
    description: "The session has taken place.",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-status-cancelled-foreground",
    badge: "bg-status-cancelled text-status-cancelled-foreground",
    description: "Called off by the student.",
  },
  rejected: {
    label: "Declined",
    dot: "bg-status-rejected-foreground",
    badge: "bg-status-rejected text-status-rejected-foreground",
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
    : "bg-muted-foreground";
}

export function appointmentStatusBadge(value: unknown): string {
  return isAppointmentStatus(value)
    ? APPOINTMENT_STATUS_PRESENTATION[value].badge
    : "bg-muted text-muted-foreground";
}
