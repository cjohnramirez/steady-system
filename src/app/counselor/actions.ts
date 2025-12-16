// fetch number of appointments, approved and pending and fetch appointments of counselor

import { Tables, TablesUpdate } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { counselorUpdateFormSchema } from "./schema";
import { createClient } from "@/utils/supabase/client";
import z from "zod";

export async function fetchCounselorAppointment(
  supabase: SupabaseClient,
  id: string,
): Promise<Tables<"appointment_with_details">> {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function fetchCounselorAppointments(
  page: number,
  pageSize: number,
  id: string,
  search: string,
  supabase: SupabaseClient,
  status: string,
): Promise<{
  data: Tables<"appointment_with_details">[];
  count: number;
}> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("appointment_with_details")
    .select("*", { count: "exact" })
    .eq("counselor_id", id);

  if (search) {
    query = query.ilike("last_student_name", `%${search}%`);
  }

  if (status) {
    query = query.eq("status", status);
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

export async function countCounselorAppointments(
  supabase: SupabaseClient,
  counselorID: string,
) {
  const { count: totalCount, error: totalError } = await supabase
    .from("appointment_with_details")
    .select("id", { count: "exact", head: true })
    .eq("counselor_id", counselorID);

  if (totalError) throw totalError;

  const { count: approvedCount, error: approvedError } = await supabase
    .from("appointment_with_details")
    .select("id", { count: "exact", head: true })
    .eq("counselor_id", counselorID)
    .eq("status", "approved");

  if (approvedError) throw approvedError;

  const { count: pendingCount, error: pendingError } = await supabase
    .from("appointment_with_details")
    .select("id", { count: "exact", head: true })
    .eq("counselor_id", counselorID)
    .eq("status", "pending");

  if (pendingError) throw pendingError;

  return {
    totalCount: totalCount || 0,
    approvedCount: approvedCount || 0,
    pendingCount: pendingCount || 0,
  };
}

// fetch profile of counselor
export async function fetchCounselorProfile(
  supabase: SupabaseClient,
  id: string,
): Promise<Tables<"counselor_with_details">> {
  const { data: counselorProfileData, error: counselorProfileError } =
    await supabase
      .from("counselor_with_details")
      .select("*")
      .eq("id", id).limit(1)
      .maybeSingle();

  if (counselorProfileError) throw counselorProfileError;

  if (!counselorProfileData) {
    throw new Error("Counselor profile not found.");
  }

  return counselorProfileData;
}

export async function fetchCounselorDeparments(
  supabase: SupabaseClient,
  counselorID: string,
): Promise<Tables<"department">[]> {
  const { data: counselorDeparmentData, error: counselorDepartmentError } =
    await supabase
      .from("department")
      .select("*")
      .eq("counselor_id", counselorID);

  if (counselorDepartmentError) throw counselorDepartmentError;

  if (!counselorDeparmentData) {
    throw new Error("Counselor departments not found.");
  }

  return counselorDeparmentData ?? [];
}

export async function updateCounselorProfile(
  values: z.infer<typeof counselorUpdateFormSchema>,
) {
  const supabase = createClient()

  const { id, ...rest} = values

  const { error } = await supabase
    .from("counselor")
    .update(rest)
    .eq("id", id)
    .select("*").single();

  if (error) throw new Error("Error updating counselor profile: ", error);
}

export async function updateCounselorAvailability(
  values: TablesUpdate<"counselor">
) {

  const supabase = createClient()

  const { error } = await supabase
    .from("counselor")
    .update(values)
    .eq("id", values.id)
    .select("*").single();

  if (error) throw new Error("Error updating counselor availability: ", error);
}

export async function updateAppointment(values: TablesUpdate<"appointment">) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("appointment")
    .update(values)
    .eq("id", values.id)
    .select("*, student:student_id(user_id, first_name, last_name), counselor:counselor_id(first_name, last_name)")
    .single();

  if (error) throw new Error("Error updating appointment: " + error.message);

  // Send notification to student when appointment is approved
  if (values.status === "approved" && data?.student?.user_id) {
    const { sendNotificationToUser } = await import("@/app/actions/notifications");
    const counselorName = `${data.counselor?.first_name || ""} ${data.counselor?.last_name || ""}`.trim();
    const scheduledDate = data.scheduled_at
      ? new Date(data.scheduled_at).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

    await sendNotificationToUser(data.student.user_id, {
      title: "Appointment Approved",
      message: `Your appointment with ${counselorName} on ${scheduledDate} has been approved.`,
      type: "appointment",
      link: "/student",
    });
  }

  // Send notification to student when appointment is rejected
  if (values.status === "rejected" && data?.student?.user_id) {
    const { sendNotificationToUser } = await import("@/app/actions/notifications");
    const counselorName = `${data.counselor?.first_name || ""} ${data.counselor?.last_name || ""}`.trim();

    await sendNotificationToUser(data.student.user_id, {
      title: "Appointment Rejected",
      message: `Your appointment with ${counselorName} has been rejected. Please book a new appointment.`,
      type: "appointment",
      link: "/student/appointment",
    });
  }

  return data;
}
