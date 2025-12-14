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
import { CircleOff, Phone, UserRoundXIcon } from "lucide-react";
import { contactObj } from "@/components/footer";

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
  } = useQuery<Tables<"counselor_with_details">[]>({
    queryKey: ["appointment-counselor"],
    queryFn: () => fetchAppointmentCounselor(getUserID, supabase),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      if (!appointmentCounselor || !date) throw new Error("Missing fields");

      return insertAppointment(supabase, getUserID, {
        counselor_id: appointmentCounselor[0].id ?? "",
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

  if (!appointmentCounselor)
    return (
      <div className="my-20 flex h-[calc(100dvh-250px)] flex-col items-center justify-center rounded-2xl">
        <div className="flex justify-start gap-10">
          <UserRoundXIcon size={40} strokeWidth={0.75} />
          <div>
            <p className="font-medium">There is no available counselor</p>
            <p>Please contact the administration office for support.</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 items-center justify-between gap-5 rounded-2xl border border-gray-200 bg-white p-6">
          {contactObj.map((contact, index) => (
            <div key={index} className="flex items-start gap-2">
              {contact.icon}
              {contact.link ? (
                <a href={contact.link} className="text-sm">
                  {contact.text}
                </a>
              ) : (
                <p className="text-sm">{contact.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );

  const appointmentCounselorName =
    (appointmentCounselor[0].first_name ?? "") +
    " " +
    (appointmentCounselor[0].last_name ?? "");

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
            appointmentDepartmentName={appointmentCounselor[0].department ?? ""}
            isLoading={isAppointmentCounselorLoading}
          />
          <DateTimeSection
            counselorData={appointmentCounselor[0] ?? null}
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
