"use client";

import { useState } from "react";
import CounselorSection from "./_components/counselor-section";
import DateTimeSection from "./_components/date-time-section";
import NotesSection from "./_components/notes-section";
import ReasonSection from "./_components/reason-section";
import { createClient } from "@/utils/supabase/client";
import { fetchAppointmentCounselor, insertAppointment } from "./actions";
import { useUserStore } from "@/hooks/auth-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Tables } from "@/types/supabase";

export default function AppointmentPage() {
  const [selectReason, setSelectReason] = useState("Academic");
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getUserID = useUserStore.getState().id;

  const supabase = createClient();

  const {
    data: appointmentCounselor,
    isLoading: isAppointmentCounselorLoading,
  } = useQuery<Tables<"counselor_with_details">>({
    queryKey: ["appointment-counselor"],
    queryFn: () => fetchAppointmentCounselor(getUserID, supabase),
  });



  const appointmentCounselorName = appointmentCounselor?.first_name ?? "";
  // fetch department of STUDENT

  const mutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      if (!appointmentCounselor || !date) throw new Error("Missing fields");

      return insertAppointment(supabase, getUserID, {
        counselor_id: appointmentCounselor.id ?? "",
        scheduled_at: date.toISOString(),
        reason: selectReason,
        notes: notes,
      });
    },
    onSuccess: () => {
      toast.success("Appointment added successfully");
      setIsLoading(false);
    },
    onError: () => {
      toast.error("Failed to add appointment");
      setIsLoading(false);
    },
  });

  return (
    <div className="space-y-6 p-10">
      <div className="space-y-2">
        <p className="text-4xl">Book an Appointment</p>
        <p>Please fill in the necessary details.</p>
      </div>
      <div className="grid h-full grid-cols-2 gap-4">
        <div className="flex h-full flex-col space-y-6">
          <ReasonSection
            selectReason={selectReason}
            setSelectReason={setSelectReason}
          />
          <NotesSection notes={notes} setNotes={setNotes} />
        </div>
        <div className="w-full space-y-6">
          <CounselorSection
            appointmentCounselorName={appointmentCounselorName}
            appointmentDepartmentName={""}
            isLoading={isAppointmentCounselorLoading}
          />
          <DateTimeSection
            counselorData={appointmentCounselor ?? null}
            date={date}
            setDate={setDate}
            isLoading={isAppointmentCounselorLoading}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancel</Button>
        <Button type="submit" onClick={() => mutation.mutate()}>
          {isLoading ? <Spinner /> : <></>}
          Book an Appointment
        </Button>
      </div>
    </div>
  );
}
