import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { PageTransition } from "@/components/motion/primitives";
import AppointmentList from "../_components/appointment-list";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function CounselorAppointmentsPage() {
  return (
    <PageTransition className="flex flex-col gap-6">
      <PageHeader
        title="Appointments & Student Requests"
        description="Review incoming bookings, confirm or reschedule times, and mark completed consultations."
      />
      <AppointmentList />
    </PageTransition>
  );
}
