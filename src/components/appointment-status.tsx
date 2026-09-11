import { cn } from "@/lib/utils";
import {
  appointmentStatusDot,
  appointmentStatusLabel,
} from "@/lib/appointments/status";

/**
 * A coloured dot and a label for one appointment status.
 *
 * The admin table, the student table and the counselor tile each carried their own
 * copy of this, and they disagreed: admin painted `approved` blue and `completed`
 * green, the counselor view painted them the other way round. They also all built
 * the label with `String(status)[0].toUpperCase()`, which throws when the status is
 * null or empty.
 */
export function AppointmentStatusDot({
  status,
  className,
}: {
  status: unknown;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          appointmentStatusDot(status),
          className,
        )}
        aria-hidden
      />
      <p>{appointmentStatusLabel(status)}</p>
    </div>
  );
}
