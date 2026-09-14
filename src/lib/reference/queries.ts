import type { DB } from "@/lib/db/types";
import { DbError } from "@/lib/db/error";

/**
 * Reference data for dropdowns. Readable signed out (the signup form needs it), so
 * these run from the browser client under row-level security rather than as
 * server actions, which Next.js runs one at a time.
 */
export async function fetchColleges(supabase: DB) {
  const { data, error } = await supabase
    .from("college")
    .select("id, abbreviation, full_name")
    .order("abbreviation");
  if (error) throw new DbError("Could not load colleges", error);
  return data;
}

export async function fetchDepartments(supabase: DB, collegeId: string) {
  if (!collegeId) return [];
  const { data, error } = await supabase
    .from("department")
    .select("id, title, college_id, counselor_id")
    .eq("college_id", collegeId)
    .order("title");
  if (error) throw new DbError("Could not load departments", error);
  return data;
}

export async function fetchEmotionalStatuses(supabase: DB) {
  const { data, error } = await supabase
    .from("emotional_status")
    .select("id, name")
    .order("name");
  if (error) throw new DbError("Could not load moods", error);
  return data;
}
