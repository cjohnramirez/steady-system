import { SupabaseClient } from "@supabase/supabase-js";
import { dataTableParams } from "../appointments/actions";
import { TablesInsert } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import { createServiceClient } from "@/utils/supabase/service";

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

export default async function insertCounselor(
  values: TablesInsert<"counselor"> & { password: string },
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const supabaseAdmin = await createServiceClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });

  if (signUpError) {
    return { error: "Counselor sign up failed" };
  }

  if (!signUpData.user?.id) {
    return { error: "User ID not found" };
  }

  const userRole: { user_id: string; role: "student" | "admin" | "counselor" } =
    {
      user_id: signUpData.user?.id as string,
      role: "counselor",
    };

  const { error: updateRoleError } = await supabaseAdmin
    .from("user_roles")
    .insert([userRole]);

  if (updateRoleError) {
    return { error: `Failed to update user role: ${updateRoleError.message}` };
  }

  const { error: updateStudentError } = await supabaseAdmin
    .from("counselor")
    .insert(values);

  if (updateStudentError) {
    return {
      error: `Failed to insert counselor: ${updateStudentError.message}`,
    };
  }

  return { success: "Sign Up successful" };
}

type AccountType = "student" | "counselor";

export async function exportAccounts(
  supabase: SupabaseClient,
  accountType: AccountType,
  amountOfData?: number,
) {
  const tableName =
    accountType === "student"
      ? "student_with_details"
      : "counselor_with_details";

  let query = supabase.from(tableName).select("*");

  if (amountOfData) {
    query = query.range(0, amountOfData);
  }

  const { data } = await query;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "export.json";
  a.click();
}
