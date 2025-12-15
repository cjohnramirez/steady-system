import { SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "@/types/supabase";

export async function insertAppointment(
  supabase: SupabaseClient,
  userId: string,
  payload: {
    counselor_id: string;
    scheduled_at: string;
    reason: string;
    notes: string;
  },
) {
  const { data: student, error: studentError } = await supabase
    .from("student_with_details")
    .select("*")
    .eq("id", userId)
    .single();

  if (studentError) throw new Error(String(studentError));

  const { error } = await supabase.from("appointment").insert({
    id: crypto.randomUUID(),
    student_id: student.id,
    counselor_id: payload.counselor_id,
    scheduled_at: payload.scheduled_at,
    reason: payload.reason,
    notes: payload.notes,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}

export async function fetchAppointmentCounselor(
  studentId: string,
  supabase: SupabaseClient,
): Promise<Tables<"counselor_with_details">[]> {
  const { data: student, error: studentError } = await supabase
    .from("student_with_details")
    .select("*")
    .eq("id", studentId);

  if (studentError) throw new Error(String(studentError));

  const { data: counselor, error: counselorError } = await supabase
    .from("counselor_with_details")
    .select("*")
    .eq("department_id", student[0].department_id);

  if (counselorError) throw new Error(String(counselorError));

  return counselor;
}
