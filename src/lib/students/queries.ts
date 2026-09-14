import type { DB } from "@/lib/db/types";
import { DbError } from "@/lib/db/error";
import {
  pageRange,
  searchPattern,
  toPage,
  type SortParam,
} from "@/lib/db/paginate";

export async function fetchStudentDetails(supabase: DB, studentId: string) {
  const { data, error } = await supabase
    .from("student_with_details")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw new DbError("Could not load the student profile", error);
  return data;
}

/** A student's own row, for fields the details view does not carry. */
export async function fetchStudentRow(supabase: DB, studentId: string) {
  const { data, error } = await supabase
    .from("student")
    .select("id, avatar, is_disabled, last_active_at")
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw new DbError("Could not load the student profile", error);
  return data;
}

/** Ordered by creation. The old query ordered by a column the table did not have. */
export async function fetchContactPersons(supabase: DB, studentId: string) {
  const { data, error } = await supabase
    .from("contact_person")
    .select("id, first_name, middle_name, last_name, phone")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });
  if (error) throw new DbError("Could not load emergency contacts", error);
  return data;
}

export type StudentListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort?: SortParam;
};

const SORTABLE = new Set([
  "last_name",
  "first_name",
  "university_id",
  "year_level",
  "department",
]);

export async function fetchStudents(
  supabase: DB,
  { page, pageSize, search, sort }: StudentListParams,
) {
  const { from, to } = pageRange(page, pageSize);
  let query = supabase
    .from("student_with_details")
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
    "Could not load students",
  );
}
