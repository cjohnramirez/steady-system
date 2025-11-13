import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchAllAppointments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select(`*`);

  if (error) throw error;
  return data || [];
}
