import type { DB } from "@/lib/db/types";
import { DbError } from "@/lib/db/error";
import {
  pageRange,
  searchPattern,
  toPage,
  type SortParam,
} from "@/lib/db/paginate";

export async function fetchCounselorDetails(supabase: DB, counselorId: string) {
  const { data, error } = await supabase
    .from("counselor_with_details")
    .select("*")
    .eq("id", counselorId)
    .maybeSingle();
  if (error) throw new DbError("Could not load the counselor", error);
  return data;
}

/** Active counselors covering a department. The view aggregates departments, so
 * a counselor with several appears once. */
export async function fetchCounselorsForDepartment(
  supabase: DB,
  departmentId: string,
) {
  const { data, error } = await supabase
    .from("counselor_with_details")
    .select("*")
    .contains("department_ids", [departmentId])
    .eq("is_active", true);
  if (error) throw new DbError("Could not load counselors", error);
  return data;
}

export async function fetchDepartmentsForCounselor(
  supabase: DB,
  counselorId: string,
) {
  const { data, error } = await supabase
    .from("department")
    .select("id, title, college:college_id(abbreviation, full_name)")
    .eq("counselor_id", counselorId)
    .order("title");
  if (error) throw new DbError("Could not load departments", error);
  return data;
}

export type CounselorListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: SortParam;
};

const SORTABLE = new Set(["last_name", "first_name", "username", "is_active"]);

export async function fetchCounselors(
  supabase: DB,
  { page, pageSize, search, sort }: CounselorListParams,
) {
  const { from, to } = pageRange(page, pageSize);
  let query = supabase
    .from("counselor_with_details")
    .select("*", { count: "exact" });

  const pattern = searchPattern(search);
  if (pattern) {
    query = query.or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `username.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `department.ilike.${pattern}`,
      ].join(","),
    );
  }

  const column = sort && SORTABLE.has(sort.id) ? sort.id : "last_name";
  return toPage(
    query
      .order(column, { ascending: sort ? !sort.desc : true })
      .order("id")
      .range(from, to),
    "Could not load counselors",
  );
}
