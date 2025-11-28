import { SupabaseClient } from "@supabase/supabase-js";
import { AppointmentCounselor } from "./page";
import z from "zod";
import { appointmentFormSchema } from "@/app/admin/appointments/@modal/schema";

export async function insertAppointment(
  supabase: SupabaseClient,
  values: z.infer<typeof appointmentFormSchema>,
) {}

export async function fetchAppointmentCounselor(
  studentId: string,
  supabase: SupabaseClient,
): Promise<AppointmentCounselor> {
  const { data: student, error: studentError } = await supabase
    .from("student_with_details")
    .select("*")
    .eq("id", studentId)
    .single();

  if (studentError) throw new Error(String(studentError));

  const { data: counselor, error: counselorError } = await supabase
    .from("counselor_with_details")
    .select("*")
    .eq("id", student.counselor_id)
    .single();

  if (counselorError) throw new Error(String(counselorError));

  return {
    departmentName: student.department,
    counselorName: `${student.counselor_first_name} ${student.counselor_last_name}`,
    counselorID: counselor.id,
    dayOfWeek: counselor.day_of_week,
    startTime: counselor.start_time,
    endTime: counselor.end_time,
    isActive: counselor.is_active,
  };
}
