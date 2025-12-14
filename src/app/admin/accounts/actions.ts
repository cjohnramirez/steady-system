import { SupabaseClient } from "@supabase/supabase-js";
import { dataTableParams } from "../appointments/actions";
import { createClient } from "@/utils/supabase/client";
import { json2csv } from "json-2-csv";

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

export async function fetchCounselors(
  supabase: SupabaseClient,
  params: dataTableParams,
) {
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

export async function fetchCounselorDepartment(counselorID: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("department")
    .select(`*`)
    .eq("counselor_id", counselorID);

  if (error) throw new Error("Error fetching counselor departments: ", error);
  return data || [];
}

export async function fetchAccountCounts(supabase: SupabaseClient) {
  const { count: studentCount, error: studentError } = await supabase
    .from("student")
    .select("*", { count: "exact", head: true });

  if (studentError) throw studentError;

  const { count: counselorCount, error: counselorError } = await supabase
    .from("counselor")
    .select("*", { count: "exact", head: true });

  if (counselorError) throw counselorError;

  const counts = {
    students: studentCount || 0,
    counselors: counselorCount || 0,
  };

  return counts;
}

export type AccountType = "students" | "counselors";
export type FileType = "csv" | "json";

export async function exportAccounts(
  supabase: SupabaseClient,
  accountType: AccountType,
  fileType: FileType,
  amountOfData?: number,
) {
  const tableName =
    accountType === "students"
      ? "student_with_details"
      : "counselor_with_details";

  let query = supabase.from(tableName).select("*");

  if (amountOfData) {
    query = query.range(0, amountOfData);
  }

  const { data } = await query;

  if (!data) {
    return;
  }

  const csv = json2csv(data);

  const url = URL.createObjectURL(
    new Blob([fileType === "csv" ? csv : JSON.stringify(data, null, 2)], {
      type: fileType === "csv" ? "text/csv" : "application/json",
    }),
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = `export.${fileType}`;
  a.click();
}
