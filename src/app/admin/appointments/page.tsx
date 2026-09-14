import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { InfoCallout } from "@/components/app/info-callout";
import AppointmentsView from "./_components/appointments-view";

export const metadata: Metadata = { title: "Appointments | GCS Admin" };

export default function AdminAppointmentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Appointments"
        description="Every booking across all counselors."
      />
      <InfoCallout title="Confidentiality">
        Appointment records are protected under the Data Privacy Act. Open notes
        only when there is an administrative need.
      </InfoCallout>
      <AppointmentsView />
    </div>
  );
}
