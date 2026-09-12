"use server";

import { createClient } from "@/utils/supabase/server";
import { requireRole } from "@/lib/auth/session";

/**
 * Dashboard metrics.
 *
 * These used to run on the service-role key with no check on the caller, which made
 * student counts and appointment volume readable by anyone who invoked the action
 * directly. They now run as the signed-in admin, so row-level security applies as a
 * second line of defence behind the `requireRole` call.
 */

function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function fetchVisitorAnalytics(daysFromNow: number) {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analytics_daily_visitor")
    .select("date, number_of_visitors")
    .gte("date", isoDate(-daysFromNow))
    .lte("date", isoDate())
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Failed to retrieve visitor analytics: ${error.message}`);
  }

  return data;
}

export async function fetchAppointmentCountAnalytics() {
  await requireRole("admin");
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("appointment")
    .select("*", { count: "exact", head: true })
    .gte("created_at", isoDate(-1))
    .lte("created_at", isoDate());

  if (error) {
    throw new Error(`Failed to retrieve appointment count: ${error.message}`);
  }

  return count ?? 0;
}

export async function fetchStudentRegisterCountAnalytics() {
  await requireRole("admin");
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("student")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Failed to retrieve student count: ${error.message}`);
  }

  return count ?? 0;
}

export async function fetchVisitorCountAnalytics() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analytics_daily_visitor")
    .select("number_of_visitors")
    .gte("date", isoDate(-30))
    .lte("date", isoDate());

  if (error) {
    throw new Error(`Failed to retrieve visitor count: ${error.message}`);
  }

  return (data ?? []).reduce((total, row) => total + row.number_of_visitors, 0);
}
