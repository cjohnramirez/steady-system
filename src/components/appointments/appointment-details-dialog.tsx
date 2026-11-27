"use client";

import { useId, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DetailList } from "@/components/app/detail-list";
import { StatusBadge } from "@/components/app/status-badge";
import { UserAvatar } from "@/components/app/user-avatar";
import { updateAppointmentNotes } from "@/lib/appointments/actions";
import type { AppointmentRow } from "@/lib/appointments/queries";
import { formatAppointmentDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

/** Appointment details, with notes the counselor or admin can keep. */
export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  canEditNotes = true,
}: {
  appointment: AppointmentRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEditNotes?: boolean;
}) {
  const queryClient = useQueryClient();
  const notesId = useId();
  const [notes, setNotes] = useState(appointment.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const student =
    `${appointment.first_student_name ?? ""} ${appointment.last_student_name ?? ""}`.trim();
  const counselor =
    `${appointment.first_counselor_name ?? ""} ${appointment.last_counselor_name ?? ""}`.trim();

  const saveNotes = () =>
    startTransition(async () => {
      const result = await updateAppointmentNotes(appointment.id!, notes);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Notes saved.");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      onOpenChange(false);
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Appointment details</DialogTitle>
          <DialogDescription>
            {formatAppointmentDate(appointment.scheduled_at)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4">
          <UserAvatar name={student || "Student"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {student || "Unknown student"}
            </p>
            <p className="text-muted-foreground truncate">
              {appointment.student_email}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        <DetailList
          items={[
            {
              label: "University ID",
              value: appointment.student_university_id,
            },
            { label: "Counselor", value: counselor },
            { label: "Reason", value: appointment.reason },
            {
              label: "Requested",
              value: formatAppointmentDate(appointment.created_at),
            },
          ]}
        />
        <div className="space-y-2">
          <label htmlFor={notesId} className="font-medium">
            Notes
          </label>
          {canEditNotes ? (
            <Textarea
              id={notesId}
              rows={4}
              maxLength={1000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Private notes about this session"
            />
          ) : (
            <p id={notesId} className="text-muted-foreground">
              {appointment.notes || "No notes."}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {canEditNotes && (
            <Button
              onClick={saveNotes}
              disabled={isPending || notes === (appointment.notes ?? "")}
              loading={isPending}
            >
              Save notes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
