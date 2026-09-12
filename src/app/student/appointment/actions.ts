import { DB } from "@/lib/db/types";
import { Tables } from "@/types/supabase";

export async function insertAppointment(
  supabase: DB,
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
  supabase: DB,
): Promise<Tables<"counselor_with_details">[]> {
  const { data: student, error: studentError } = await supabase
    .from("student_with_details")
    .select("department_id")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) {
    throw new Error(`Could not load your profile: ${studentError.message}`);
  }

  // Indexing straight into the array used to throw here when the query came back
  // empty, which is what a student with no readable profile row sees.
  if (!student?.department_id) {
    return [];
  }

  const { data: counselor, error: counselorError } = await supabase
    .from("counselor_with_details")
    .select("*")
    .eq("department_id", student.department_id);

  if (counselorError) {
    throw new Error(`Could not load counselors: ${counselorError.message}`);
  }

  return counselor ?? [];
}
