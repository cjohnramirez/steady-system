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
import { useQuery } from "@tanstack/react-query";
import { fetchCounselorAppointment, fetchCounselorProfile } from "../actions";
import { createClient } from "@/utils/supabase/client";
import DateTimeSection from "@/app/student/appointment/_components/date-time-section";
import { useState } from "react";
import { useUserStore } from "@/hooks/auth-store";

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
  const supabase = createClient();
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
            <Button
              onClick={() => {
                setOpen(false);
              }}
            >
              Reschedule
            </Button>
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
