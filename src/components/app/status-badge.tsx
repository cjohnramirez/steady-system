import { cn } from "@/lib/utils";
import {
  appointmentStatusBadge,
  appointmentStatusLabel,
} from "@/lib/appointments/status";

/** An appointment status as a small tinted pill. Colours come from status tokens. */
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        appointmentStatusBadge(status),
        className,
      )}
    >
      {appointmentStatusLabel(status)}
    </span>
  );
}
