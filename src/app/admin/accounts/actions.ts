import { DB } from "@/lib/db/types";
import { createClient } from "@/utils/supabase/client";
import { json2csv } from "json-2-csv";
import { DbError } from "@/lib/db/error";
import { pageRange, toPage, type PageParams } from "@/lib/db/paginate";

/**
 * These functions previously shared `dataTableParams` with the appointments
 * screen, which carries a `status` field. Accounts has no status to filter on, so
 * the page was passing its tab name ("students" or "counselors") as a status and
 * both functions were quietly ignoring it. Accounts gets its own parameters.
 */

export async function fetchStudents(supabase: DB, params: PageParams) {
  const { from, to } = pageRange(params.page, params.pageSize);

  let query = supabase
    .from("student_with_details")
    .select("*", { count: "exact" });

  if (params.search) {
    query = query.ilike("username", `%${params.search}%`);
  }

  return toPage(
    query.range(from, to).order("id", { ascending: false }),
    "Could not load students",
  );
}

export async function fetchCounselors(supabase: DB, params: PageParams) {
  const { from, to } = pageRange(params.page, params.pageSize);

  let query = supabase
    .from("counselor_with_details")
    .select("*", { count: "exact" });

  if (params.search) {
    query = query.ilike("username", `%${params.search}%`);
  }

  return toPage(
    query.range(from, to).order("id", { ascending: false }),
    "Could not load counselors",
  );
}

export async function fetchCounselorDepartment(counselorID: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("department")
    .select("*")
    .eq("counselor_id", counselorID);

  if (error) throw new DbError("Could not load counselor departments", error);

  return data ?? [];
}

export async function fetchAccountCounts(supabase: DB) {
  const [students, counselors] = await Promise.all([
    supabase.from("student").select("*", { count: "exact", head: true }),
    supabase.from("counselor").select("*", { count: "exact", head: true }),
  ]);

  if (students.error) {
    throw new DbError("Could not count students", students.error);
  }
  if (counselors.error) {
    throw new DbError("Could not count counselors", counselors.error);
  }

  return {
    students: students.count ?? 0,
    counselors: counselors.count ?? 0,
  };
}

export async function assignDepartment(
  counselorID: string,
  departments: Array<{ department_id: string }>,
) {
  const supabase = createClient();
  const departmentIds = departments.map((d) => d.department_id);

  if (departmentIds.length === 0) {
    throw new Error("Select at least one department.");
  }

  const { data: existing, error: checkError } = await supabase
    .from("department")
    .select("id")
    .in("id", departmentIds);

  if (checkError) {
    throw new DbError("Could not check the selected departments", checkError);
  }

  if (!existing || existing.length !== departmentIds.length) {
    throw new Error(
      "One or more of the selected departments no longer exists.",
    );
  }

  const { data, error } = await supabase
    .from("department")
    .update({ counselor_id: counselorID })
    .in("id", departmentIds)
    .select();

  if (error) throw new DbError("Could not assign the department", error);

  // An empty result here means row-level security filtered the update out rather
  // than the rows being missing, since their existence was just confirmed.
  if (!data || data.length === 0) {
    throw new Error("You do not have permission to assign these departments.");
  }

  return data;
}

export type AccountType = "students" | "counselors";
export type FileType = "csv" | "json";

export async function exportAccounts(
  supabase: DB,
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

  const { data, error } = await query;

  if (error) throw new DbError("Could not export accounts", error);
  if (!data || data.length === 0) {
    throw new Error("There is nothing to export.");
  }

  const body =
    fileType === "csv" ? json2csv(data) : JSON.stringify(data, null, 2);
  const url = URL.createObjectURL(
    new Blob([body], {
      type: fileType === "csv" ? "text/csv" : "application/json",
    }),
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = `export.${fileType}`;
  a.click();

  // Without this the blob is held for the lifetime of the document.
  URL.revokeObjectURL(url);
}
