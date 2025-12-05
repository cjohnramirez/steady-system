"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCounselorAppointment,
  fetchCounselorProfile,
  updateAppointment,
} from "../actions";
import { createClient } from "@/utils/supabase/client";
import DateTimeSection from "@/app/student/appointment/_components/date-time-section";
import { useState } from "react";
import { useUserStore } from "@/hooks/auth-store";
import { useConfirmStore } from "@/hooks/confirm-store";
import { toast } from "sonner";

interface RescheduleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

export default function RescheduleModal({
  open,
  setOpen,
  id,
}: RescheduleModalProps) {
  const { confirm } = useConfirmStore();

  const supabase = createClient();
  const queryClient = useQueryClient();
  const userID = useUserStore.getState().id;

  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: counselorAppointment } = useQuery({
    queryKey: ["counselor-appointment", id],
    queryFn: () => fetchCounselorAppointment(supabase, id),
  });

  const { data: counselorProfile, isLoading: isCounselorProfileLoading } =
    useQuery({
      queryKey: ["appointment-counselor"],
      queryFn: () => fetchCounselorProfile(supabase, userID),
    });

  const updateMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: async () => {
      toast.success("Counselor profile updated successfully!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["counselor-profile"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update counselor profile");
    },
  });

  const handleSubmit = async () => {
    const ok = await confirm(
      "Change this appointment?",
      "This action cannot be undone.",
    );

    if (!ok) return;

    if (!date) {
      toast.error("Please select a valid date and time");
      return;
    }

    updateMutation.mutate({
      scheduled_at: date.toISOString(),
      id: counselorAppointment?.id ?? "",
    });

    queryClient.invalidateQueries({
      queryKey: ["counselor-appointment", counselorAppointment?.id ?? ""],
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-[800px]"
        showCloseButton={false}
        onInteractOutside={() => {
          setOpen(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <DateTimeSection
          date={date}
          setDate={setDate}
          counselorData={counselorProfile ?? null}
          isLoading={isCounselorProfileLoading}
          isRescheduleModal={true}
          appointmentData={counselorAppointment}
        />
        <DialogFooter>
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>Reschedule</Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
