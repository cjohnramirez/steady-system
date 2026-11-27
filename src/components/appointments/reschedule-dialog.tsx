"use client";

import { useMemo, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { rescheduleAppointment } from "@/lib/appointments/actions";
import type { AppointmentRow } from "@/lib/appointments/queries";
import { fetchCounselorDetails } from "@/lib/counselors/queries";
import { formatAppointmentDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { SlotPicker } from "./slot-picker";

/**
 * Moves an appointment to another free slot. The student is notified by the
 * database trigger.
 *
 * Replaces a modal that defaulted to "now" (so saving without choosing sent the
 * current minute, which was refused), refreshed the wrong list afterwards, toasted
 * "Counselor profile updated", and left its confirm dialog stuck open.
 */
export function RescheduleDialog({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [slot, setSlot] = useState("");
  const [isPending, startTransition] = useTransition();

  const counselor = useQuery({
    queryKey: queryKeys.counselors.detail(appointment.counselor_id ?? ""),
    queryFn: () => fetchCounselorDetails(supabase, appointment.counselor_id!),
    enabled: Boolean(appointment.counselor_id),
  });

  const unchanged =
    slot && appointment.scheduled_at
      ? new Date(slot).getTime() ===
        new Date(appointment.scheduled_at).getTime()
      : false;

  const save = () =>
    startTransition(async () => {
      const result = await rescheduleAppointment(appointment.id!, slot);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.availableSlots.all,
      });
      if (!result.ok) {
        toast.error(result.error);
        setSlot("");
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      toast.success(
        `Moved to ${formatAppointmentDate(slot)}. The student has been notified.`,
      );
      onOpenChange(false);
    });

  const student =
    `${appointment.first_student_name ?? ""} ${appointment.last_student_name ?? ""}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            {student} · currently{" "}
            {formatAppointmentDate(appointment.scheduled_at)}
          </DialogDescription>
        </DialogHeader>
        {counselor.data ? (
          <SlotPicker
            counselor={{
              id: counselor.data.id!,
              day_of_week: counselor.data.day_of_week,
            }}
            value={slot}
            onChange={setSlot}
            heldSlot={appointment.scheduled_at}
          />
        ) : (
          <Skeleton className="h-80 rounded-xl" />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            loading={isPending}
            onClick={save}
            disabled={!slot || unchanged || isPending}
          >
            Move appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
