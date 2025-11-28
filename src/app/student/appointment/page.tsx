"use client";

import { useState } from "react";
import CounselorSection from "./_components/counselor-section";
import DateTimeSection from "./_components/date-time-section";
import NotesSection from "./_components/notes-section";
import ReasonSection from "./_components/reason-section";
import { createClient } from "@/utils/supabase/client";
import { fetchAppointmentCounselor } from "./actions";
import { useUserStore } from "@/hooks/auth-store";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export type AppointmentCounselor = {
  departmentName: string;
  counselorName: string;
  counselorID: string;
  dayOfWeek: boolean[];
  startTime: string;
  endTime: string;
  isActive: boolean;
};

export default function AppointmentPage() {
  const [selectReason, setSelectReason] = useState("Academic");
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const getStudentID = useUserStore.getState().id;

  const supabase = createClient();

  console.log(date?.toISOString());

  const {
    data: appointmentCounselor,
    isLoading: isAppointmentCounselorLoading,
  } = useQuery<AppointmentCounselor>({
    queryKey: ["appointment-counselor"],
    queryFn: () => fetchAppointmentCounselor(getStudentID, supabase),
  });

  const appointmentCounselorName = appointmentCounselor?.counselorName ?? "";
  const appointmentDepartmentName = appointmentCounselor?.departmentName ?? "";

  const handleSubmit = (): void => {
    console.log({
      student_id: getStudentID,
      counselor_id: appointmentCounselor?.counselorID,
      scheduled_at: date?.toISOString(),
      status: "pending",
      notes: notes,
      created_at: new Date(),
      reason: selectReason
    });
  }

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
            appointmentDepartmentName={appointmentDepartmentName}
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
        <Button type="submit" onClick={handleSubmit}>Book an Appointment</Button>
      </div>
    </div>
  );
}
