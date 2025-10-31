import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchStudents(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("student_with_details")
    .select("*");
  if (error) throw error;
  return data || [];
}

export async function fetchAdmins(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("admin").select("*");
  if (error) throw error;
  return data || [];
}

export async function fetchCounselors(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("counselor_with_details")
    .select("*");
  if (error) throw error;
  return data || [];
}
