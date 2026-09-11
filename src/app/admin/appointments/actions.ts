import { DB } from "@/lib/db/types";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { pageRange, toPage, type PageParams } from "@/lib/db/paginate";

export type AppointmentTableParams = PageParams & {
  /** A status to filter by, or "all" for no filter. */
  status: AppointmentStatus | "all";
};

export async function fetchAppointments(
  supabase: DB,
  params: AppointmentTableParams,
) {
  const { from, to } = pageRange(params.page, params.pageSize);

  let query = supabase
    .from("appointment_with_details")
    .select("*", { count: "exact" });

  if (params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.search) {
    query = query.ilike("last_student_name", `%${params.search}%`);
  }

  return toPage(
    query.range(from, to).order("scheduled_at", { ascending: false }),
    "Could not load appointments",
  );
}
