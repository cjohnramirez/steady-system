"use client";

import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useConfirm, type ConfirmOptions } from "@/hooks/use-confirm";
import { setAppointmentStatus } from "@/lib/appointments/actions";
import { queryKeys } from "@/lib/query-keys";

type Decision = "approved" | "rejected" | "completed" | "cancelled";

const COPY: Record<Decision, ConfirmOptions & { success: string }> = {
  approved: {
    title: "Accept this appointment?",
    description: "The student will be notified that it's confirmed.",
    confirmLabel: "Accept",
    success: "Appointment accepted.",
  },
  rejected: {
    title: "Decline this request?",
    description: "The student will be notified and can book another time.",
    confirmLabel: "Decline",
    destructive: true,
    success: "Request declined.",
  },
  completed: {
    title: "Mark as completed?",
    description: "Use this once the session has taken place.",
    confirmLabel: "Mark completed",
    success: "Marked as completed.",
  },
  cancelled: {
    title: "Cancel this appointment?",
    description: "The student will be notified and the slot freed up.",
    confirmLabel: "Cancel appointment",
    cancelLabel: "Keep it",
    destructive: true,
    success: "Appointment cancelled.",
  },
};

/** Confirm, change the status, refresh every appointment list and the slot cache. */
export function useAppointmentDecision() {
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const decide = async (id: string, decision: Decision) => {
    const { success, ...options } = COPY[decision];
    if (!(await confirm(options))) return;

    startTransition(async () => {
      const result = await setAppointmentStatus(id, decision);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.availableSlots.all,
        }),
      ]);
    });
  };

  return { decide, isPending };
}
