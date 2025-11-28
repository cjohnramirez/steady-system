// fetch number of appointments, approved and pending and fetch appointments of counselor

import { Tables } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

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
  id: string,
) {
  const { count: totalCount, error: totalError } = await supabase
    .from("appointment_with_details")
    .select("id", { count: "exact", head: true })
    .eq("counselor_id", id);

  if (totalError) throw totalError;

  const { count: approvedCount, error: approvedError } = await supabase
    .from("appointment_with_details")
    .select("id", { count: "exact", head: true })
    .eq("counselor_id", id)
    .eq("status", "approved");

  if (approvedError) throw approvedError;

  const { count: pendingCount, error: pendingError } = await supabase
    .from("appointment_with_details")
    .select("id", { count: "exact", head: true })
    .eq("counselor_id", id)
    .eq("status", "pending");

  if (pendingError) throw pendingError;

  return {
    totalCount: totalCount || 0,
    approvedCount: approvedCount || 0,
    pendingCount: pendingCount || 0,
  };
}

// fetch profile of counselor
export async function fetchCounselorProfile({
  supabase,
  id,
}: {
  supabase: SupabaseClient;
  id: string;
}): Promise<Tables<"counselor_with_details">> {
  const { data: counselorProfileData, error: counselorProfileError } =
    await supabase
      .from("counselor_with_details")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (counselorProfileError) throw counselorProfileError;

  if (!counselorProfileData) {
    throw new Error("Counselor profile not found.");
  }

  return counselorProfileData;
}
