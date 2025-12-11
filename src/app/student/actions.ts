import { SupabaseClient } from "@supabase/supabase-js";

export type studentAppointmentParams = {};

export async function fetchStudentAppointment(
  page: number,
  pageSize: number,
  studentID: string,
  search: string,
  supabase: SupabaseClient,
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("appointment_with_details")
    .select("*", { count: "exact" })
    .eq("student_id", studentID);

  if (search) {
    query = query.ilike("last_counselor_name", `%${search}%`);
  }

  const { data, error, count } = await query
    .range(from, to)
    .order("id", { ascending: false });

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}
