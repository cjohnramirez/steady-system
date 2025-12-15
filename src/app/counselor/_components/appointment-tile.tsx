"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/types/supabase";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import CounselorAppointmentModal from "./appointment-modal";
import { dateToString } from "@/lib/format";
import RescheduleModal from "./reschedule-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointment } from "../actions";
import { toast } from "sonner";
import { deleteStudentAppointment } from "@/app/student/actions";
import { useConfirmStore } from "@/hooks/confirm-store";

export default function CounselorAppointmentTile({
  appointment,
  isLoading,
}: {
  appointment?: Tables<"appointment_with_details">;
  isLoading: boolean;
}) {
  const [openAppointment, setOpenAppointment] = useState(false);
  const [openReschedule, setOpenReschedule] = useState(false);

  const queryClient = useQueryClient();
  const { confirm, startLoading, stopLoading } = useConfirmStore();

  const updateMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: async () => {
      toast.success("Appointment updated successfully!");
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ["counselor-appointments"] });
    },
    onError: (err: Error) => {
      stopLoading();
      toast.error(err.message || "Failed to update appointment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStudentAppointment,
    onSuccess: async () => {
      toast.success("Appointment deleted successfully!");
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ["counselor-appointments"] });
    },
    onError: (err: Error) => {
      stopLoading();
      toast.error(err.message || "Failed to delete appointment");
    },
  });


  if (isLoading)
    return (
      <div className="flex flex-col gap-4 rounded-2xl border p-6">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex flex-1 items-start justify-end">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    );

  if (!appointment) return;

  return (
    <>
      {openAppointment && (
        <CounselorAppointmentModal
          id={appointment.id ?? ""}
          open={openAppointment}
          setOpen={setOpenAppointment}
        />
      )}
      {openReschedule && (
        <RescheduleModal
          id={appointment.id ?? ""}
          open={openReschedule}
          setOpen={setOpenReschedule}
        />
      )}
      <div className="flex flex-col gap-4 rounded-2xl border p-6">
        <div className="flex gap-4">
          <div className="from-brand-light to-brand-normal h-10 w-10 rounded-full bg-linear-to-t" />
          <div>
            <p className="font-medium">Name of Student</p>
            <p>
              {appointment.first_student_name +
                " " +
                appointment.last_student_name}
            </p>
          </div>
          <div
            className="flex flex-1 cursor-pointer items-start justify-end"
            onClick={() => {
              setOpenAppointment(true);
            }}
          >
            <ArrowUpRight
              className="rounded-full border border-gray-200 p-2"
              size={40}
              strokeWidth={1.25}
            />
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-medium">Scheduled At</p>
            <p>{dateToString(appointment.scheduled_at ?? "")}</p>
          </div>
          <div className="flex-1">
            <p className="font-medium">Reason</p>
            <p>{appointment.reason}</p>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setOpenReschedule(true);
            }}
          >
            Reschedule
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOpenAppointment(true);
            }}
          >
            View Appointment
          </Button>
          {appointment.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={async () => {
                  const ok = await confirm(
                    "Accept appointment?",
                    "This appointment will be marked as approved.",
                  );
                  if (ok) {
                    startLoading();
                    updateMutation.mutate({ status: "approved" });
                  }
                }}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const ok = await confirm(
                    "Reject appointment?",
                    "This appointment will be deleted.",
                  );
                  if (ok) {
                    startLoading();
                    deleteMutation.mutate(appointment.id ?? "");
                  }
                }}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
