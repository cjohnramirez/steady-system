import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchAllAppointments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select(`*`);

  if (error) throw error;
  return data || [];
}

export async function fetchPendingAppointments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select(`*`)
    .eq("status", "pending");

  if (error) throw error;
  return data || [];
}

export async function fetchApprovedAppointments(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select(`*`)
    .eq("status", "approved");

  if (error) throw error;
  return data || [];
}