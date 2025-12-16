"use client";

import { useState } from "react";
import CounselorSection from "./_components/counselor-section";
import DateTimeSection from "./_components/date-time-section";
import NotesSection from "./_components/notes-section";
import ReasonSection from "./_components/reason-section";
import { createClient } from "@/utils/supabase/client";
import { fetchAppointmentCounselor, insertAppointment } from "./actions";
import { fetchOrganization } from "@/app/home/actions";
import { useUserStore } from "@/hooks/auth-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Tables } from "@/types/supabase";
import { MapPin, Mail, Phone, Clock, UserRoundXIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppointmentPage() {
  const [selectReason, setSelectReason] = useState("Academic");
  const [isTimeSelected, setIsTimeSelected] = useState(false);

  const [date, setDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getUserID = useUserStore.getState().id;

  const supabase = createClient();
  const router = useRouter();

  const parseTime = (timeString: string): string => {
    if (!timeString) return "";
    const timePart = timeString.split("+")[0] || timeString.split("-")[0];
    const [hours, minutes] = timePart.split(":").slice(0, 2);
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const {
    data: appointmentCounselor,
    isLoading: isAppointmentCounselorLoading,
  } = useQuery<Tables<"counselor_with_details">[]>({
    queryKey: ["appointment-counselor"],
    queryFn: () => fetchAppointmentCounselor(getUserID, supabase),
  });

  const { data: organization } = useQuery({
    queryKey: ["organization"],
    queryFn: fetchOrganization,
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
      router.replace("/student");
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
          {organization?.office_location && (
            <div className="flex items-start gap-2">
              <MapPin size={20} strokeWidth={1} />
              <p className="text-sm">{organization.office_location}</p>
            </div>
          )}
          {organization?.email && (
            <div className="flex items-start gap-2">
              <Mail size={20} strokeWidth={1} />
              <a href={`mailto:${organization.email}`} className="text-sm">
                {organization.email}
              </a>
            </div>
          )}
          {organization?.phone && (
            <div className="flex items-start gap-2">
              <Phone size={20} strokeWidth={1} />
              <a href={`tel:${organization.phone}`} className="text-sm">
                {organization.phone}
              </a>
            </div>
          )}
          {organization?.start_office_hour && organization?.end_office_hour && (
            <div className="flex items-start gap-2">
              <Clock size={20} strokeWidth={1} />
              <p className="text-sm">
                {parseTime(organization.start_office_hour)} -{" "}
                {parseTime(organization.end_office_hour)}
              </p>
            </div>
          )}
        </div>
      </div>
    );

  const appointmentCounselorName =
    (appointmentCounselor[0].first_name ?? "") +
    " " +
    (appointmentCounselor[0].last_name ?? "");

  console.log(date);

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
            setIsTimeSelected={setIsTimeSelected}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancel</Button>
        <Button
          type="submit"
          onClick={() => {
            if (isTimeSelected) mutation.mutate();
          }}
          disabled={!isTimeSelected}
        >
          {isLoading ? <Spinner /> : <></>}
          Book an Appointment
        </Button>
      </div>
    </div>
  );
}
