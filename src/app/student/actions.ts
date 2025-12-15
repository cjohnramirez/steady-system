import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "@/types/supabase";

export async function deleteStudentAppointment(
  appointmentID: string,
): Promise<{ error?: string; success?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("appointment")
    .delete()
    .eq("id", appointmentID);

  if (error)
    return {
      error: "Appointment cancel failed",
    };

  return {
    success: "Appointment cancelled successfully",
  };
}

export async function fetchContactPersons(
  studentId: string,
): Promise<Tables<"contact_person">[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("contact_person")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });

  if (error)
    throw new Error(`Error fetching contact persons: ${error.message}`);
  return data || [];
}

export async function updateContactPersons(
  studentId: string,
  contactPersons: Array<{
    id?: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    phone: string;
  }>,
): Promise<Tables<"contact_person">[]> {
  const supabase = createClient();

  try {
    const { error: deleteError } = await supabase
      .from("contact_person")
      .delete()
      .eq("student_id", studentId);

    if (deleteError) throw deleteError;

    const contactPersonsToInsert = contactPersons.map((cp) => ({
      student_id: studentId,
      first_name: cp.first_name,
      last_name: cp.last_name,
      middle_name: cp.middle_name,
      phone: Number(cp.phone),
    }));

    const { data, error: insertError } = await supabase
      .from("contact_person")
      .insert(contactPersonsToInsert)
      .select();

    if (insertError) throw insertError;

    return data || [];
  } catch (error: any) {
    throw new Error(`Error updating contact persons: ${error.message}`);
  }
}

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
