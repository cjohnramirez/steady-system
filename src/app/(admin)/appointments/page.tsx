"use client";

import { DataTable } from "../../../components/data-table";
import { appointmentsData } from "@/lib/data/appointments-data";
import { appointmentColumns } from "./columns";

export default function AppointmentPage() {
  return (
    <div className="p-8">
      <DataTable columns={appointmentColumns} data={appointmentsData} searchQuery="studentName"/>
    </div>
  );
}
