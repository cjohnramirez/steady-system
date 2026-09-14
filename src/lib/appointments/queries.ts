import type { DB } from "@/lib/db/types";
import type { Tables } from "@/types/supabase";
import { DbError } from "@/lib/db/error";
import {
  pageRange,
  searchPattern,
  toPage,
  type SortParam,
} from "@/lib/db/paginate";
import type { AppointmentStatus } from "./status";

export type AppointmentRow = Tables<"appointment_with_details">;

export type AppointmentListParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: AppointmentStatus;
  sort?: SortParam;
};

const SORTABLE = new Set([
  "scheduled_at",
  "created_at",
  "status",
  "last_student_name",
  "last_counselor_name",
]);

/**
 * Reads run from the browser under row-level security: a student sees their own
 * appointments, a counselor sees theirs, an admin sees all. The filters below are
 * for narrowing, not for access control.
 *
 * Lists used to order by uuid, which is random, so history came back shuffled.
 */
function listAppointments(
  supabase: DB,
  scope: { column: "student_id" | "counselor_id"; id: string } | null,
  { page, pageSize, search, status, sort }: AppointmentListParams,
) {
  const { from, to } = pageRange(page, pageSize);
  let query = supabase
    .from("appointment_with_details")
    .select("*", { count: "exact" });

  if (scope) query = query.eq(scope.column, scope.id);
  if (status) query = query.eq("status", status);

  const pattern = searchPattern(search);
  if (pattern) {
    query = query.or(
      [
        `first_student_name.ilike.${pattern}`,
        `last_student_name.ilike.${pattern}`,
        `first_counselor_name.ilike.${pattern}`,
        `last_counselor_name.ilike.${pattern}`,
        `reason.ilike.${pattern}`,
      ].join(","),
    );
  }

  const column = sort && SORTABLE.has(sort.id) ? sort.id : "scheduled_at";
  const ascending = sort ? !sort.desc : false;

  return toPage(
    query.order(column, { ascending }).order("id").range(from, to),
    "Could not load appointments",
  );
}

export const fetchStudentAppointments = (
  supabase: DB,
  studentId: string,
  params: AppointmentListParams,
) =>
  listAppointments(supabase, { column: "student_id", id: studentId }, params);

export const fetchCounselorAppointments = (
  supabase: DB,
  counselorId: string,
  params: AppointmentListParams,
) =>
  listAppointments(
    supabase,
    { column: "counselor_id", id: counselorId },
    params,
  );

export const fetchAllAppointments = (
  supabase: DB,
  params: AppointmentListParams,
) => listAppointments(supabase, null, params);

export async function fetchAppointment(supabase: DB, id: string) {
  const { data, error } = await supabase
    .from("appointment_with_details")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new DbError("Could not load the appointment", error);
  return data;
}

export type CounselorAppointmentCounts = {
  total: number;
  pending: number;
  approved: number;
  completed: number;
};

/** Four head counts in parallel. They used to run one after another. */
export async function fetchCounselorAppointmentCounts(
  supabase: DB,
  counselorId: string,
): Promise<CounselorAppointmentCounts> {
  const count = (status?: AppointmentStatus) => {
    let query = supabase
      .from("appointment")
      .select("id", { count: "exact", head: true })
      .eq("counselor_id", counselorId);
    if (status) query = query.eq("status", status);
    return query;
  };

  const results = await Promise.all([
    count(),
    count("pending"),
    count("approved"),
    count("completed"),
  ]);
  const failed = results.find((result) => result.error);
  if (failed?.error)
    throw new DbError("Could not count appointments", failed.error);

  const [total, pending, approved, completed] = results.map(
    (result) => result.count ?? 0,
  );
  return { total, pending, approved, completed };
}

/**
 * Bookable instants for one counselor on one Manila calendar day, straight from
 * get_available_slots, so a slot someone else holds is never offered.
 */
export async function fetchAvailableSlots(
  supabase: DB,
  counselorId: string,
  day: string,
) {
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_counselor_id: counselorId,
    p_day: day,
  });
  if (error) throw new DbError("Could not load available times", error);
  return (data ?? []) as string[];
}
