import { cn } from "@/lib/utils";
import {
  appointmentStatusBadge,
  appointmentStatusLabel,
} from "@/lib/appointments/status";

/** An appointment status as a tinted pill. Colors come from global status tokens. */
export function StatusBadge({
  status,
  className,
}: {
  status: unknown;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shadow-steady-card inline-flex items-center rounded-[35px] px-3 py-1 text-xs font-medium whitespace-nowrap",
        appointmentStatusBadge(status),
        className,
      )}
    >
      {appointmentStatusLabel(status)}
    </span>
  );
}

const URGENCY_STYLES = {
  high: "bg-status-rejected text-status-rejected-foreground",
  medium: "bg-status-pending text-status-pending-foreground",
  low: "bg-status-approved text-status-approved-foreground",
} as const;

const URGENCY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: "low" | "medium" | "high";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shadow-steady-card inline-flex items-center rounded-[35px] px-3 py-1 text-xs font-medium whitespace-nowrap",
        URGENCY_STYLES[urgency] ?? URGENCY_STYLES.low,
        className,
      )}
    >
      {URGENCY_LABELS[urgency] ?? "Low"}
    </span>
  );
}
