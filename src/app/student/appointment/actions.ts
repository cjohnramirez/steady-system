import { SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "@/types/supabase";
import { sendNotificationToUser } from "@/app/actions/notifications";

export async function getBookedTimeSlots(
  supabase: SupabaseClient,
  counselorId: string,
  date: string,
): Promise<string[]> {
  const startOfDay = `${date} 00:00:00+00`;
  const endOfDay = `${date} 23:59:59+00`;

  const { data: appointments, error } = await supabase
    .from("appointment")
    .select("scheduled_at")
    .eq("counselor_id", counselorId)
    .in("status", ["pending", "confirmed"])
    .gte("scheduled_at", startOfDay)
    .lt("scheduled_at", endOfDay);

  if (error) throw new Error(String(error));
  return (appointments || []).map((apt) => apt.scheduled_at);
}

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

  // Get counselor info for notification
  const { data: counselor, error: counselorError } = await supabase
    .from("counselor")
    .select("*")
    .eq("id", payload.counselor_id)
    .single();

  if (counselorError) throw new Error(String(counselorError));

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

  // Format the scheduled date for notification
  const scheduledDate = new Date(payload.scheduled_at).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Notify student
  if (student.user_id) {
    await sendNotificationToUser(student.user_id, {
      title: "Appointment Booked",
      message: `Your appointment with ${counselor.first_name} ${counselor.last_name} is scheduled for ${scheduledDate}`,
      type: "appointment",
      link: "/student",
    });
  }

  // Notify counselor
  if (counselor.user_id) {
    await sendNotificationToUser(counselor.user_id, {
      title: "New Appointment Request",
      message: `${student.first_name} ${student.last_name} booked an appointment for ${scheduledDate}`,
      type: "appointment",
      link: "/counselor",
    });
  }
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
