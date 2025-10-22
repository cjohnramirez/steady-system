"use client";

import { DataTable } from "../../../components/data-table";
import { appointmentsData } from "@/lib/data/appointments-data";
import { appointmentColumns } from "./appointment-column";

export default function AppointmentPage() {
  return (
    <div>
      <DataTable columns={appointmentColumns} data={appointmentsData} searchQuery="studentName"/>
    </div>
  );
}
