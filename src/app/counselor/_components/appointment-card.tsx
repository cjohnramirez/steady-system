"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/app/status-badge";
import { UserAvatar } from "@/components/app/user-avatar";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";
import { RescheduleDialog } from "@/components/appointments/reschedule-dialog";
import { useAppointmentDecision } from "@/components/appointments/use-appointment-actions";
import type { AppointmentRow } from "@/lib/appointments/queries";
import { formatAppointmentDate } from "@/lib/format";

export default function AppointmentCard({
  appointment,
}: {
  appointment: AppointmentRow;
}) {
  const [dialog, setDialog] = useState<"details" | "reschedule" | null>(null);
  const { decide, isPending } = useAppointmentDecision();
  const id = appointment.id!;
  const student =
    `${appointment.first_student_name ?? ""} ${appointment.last_student_name ?? ""}`.trim();
  const isUpcoming = new Date(appointment.scheduled_at ?? 0) > new Date();

  return (
    <article className="flex flex-col gap-4 rounded-xl border p-4">
      <header className="flex items-start gap-3">
        <UserAvatar name={student || "Student"} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">
            {student || "Unknown student"}
          </h3>
          <p className="text-muted-foreground">
            {formatAppointmentDate(appointment.scheduled_at)}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </header>
      <p className="line-clamp-2">
        <span className="text-muted-foreground">Reason: </span>
        {appointment.reason || "Not given"}
      </p>
      <footer className="flex flex-wrap items-center justify-end gap-2">
        {appointment.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => decide(id, "rejected")}
            >
              Decline
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => decide(id, "approved")}
            >
              Accept
            </Button>
          </>
        )}
        {appointment.status === "approved" && !isUpcoming && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => decide(id, "completed")}
          >
            Mark completed
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`More actions for ${student}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDialog("details")}>
              View details and notes
            </DropdownMenuItem>
            {(appointment.status === "pending" ||
              appointment.status === "approved") && (
              <DropdownMenuItem onSelect={() => setDialog("reschedule")}>
                Reschedule
              </DropdownMenuItem>
            )}
            {appointment.status === "approved" && (
              <>
                {isUpcoming && (
                  <DropdownMenuItem onSelect={() => decide(id, "completed")}>
                    Mark completed
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => decide(id, "cancelled")}
                >
                  Cancel appointment
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>

      {dialog === "details" && (
        <AppointmentDetailsDialog
          appointment={appointment}
          open
          onOpenChange={() => setDialog(null)}
        />
      )}
      {dialog === "reschedule" && (
        <RescheduleDialog
          appointment={appointment}
          open
          onOpenChange={() => setDialog(null)}
        />
      )}
    </article>
  );
}
