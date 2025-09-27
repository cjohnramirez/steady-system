"use client";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { appointmentsData } from "@/lib/data/appointments-data";

export default function AppointmentPage() {
  return (
    <div className="p-8">
      <DataTable columns={columns} data={appointmentsData} />
    </div>
  );
}
