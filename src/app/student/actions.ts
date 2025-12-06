import { SupabaseClient } from "@supabase/supabase-js";

export type studentAppointmentParams = {
  page: number;
  pageSize: number;
  id: string;
  search: string;
  supabase: SupabaseClient;
};

export async function fetchStudentAppointment({
  page,
  pageSize,
  id,
  search,
  supabase,
}: studentAppointmentParams) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data: studentData, error: studentError } = await supabase
    .from("student")
    .select("*")
    .eq("user_id", id)
    .single();

  if (studentError) throw studentError;

  let query = supabase
    .from("appointment_with_details")
    .select("*", { count: "exact" })
    .eq("student_id", studentData.id);

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
