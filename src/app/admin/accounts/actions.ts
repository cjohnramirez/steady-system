import { SupabaseClient } from "@supabase/supabase-js";
import { dataTableParams } from "../appointments/actions";

export async function fetchStudents(
  supabase: SupabaseClient,
  params: dataTableParams,
) {
  const { page, pageSize, search } = params;

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("student_with_details")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("username", `%${search}%`);
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

export async function fetchCounselors(supabase: SupabaseClient, params: dataTableParams) {
  const { page, pageSize, search } = params;

  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("counselor_with_details")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("username", `%${search}%`);
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
