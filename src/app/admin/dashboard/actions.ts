"use server";

import { createServiceClient } from "@/utils/supabase/service";

export async function fetchVisitorAnalytics(daysFromNow: number) {
  const supabaseAdmin = await createServiceClient();
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - daysFromNow);

  const fromDate = past.toISOString().slice(0, 10);
  const toDate = now.toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("analytics_daily_visitor")
    .select("date, number_of_visitors")
    .gte("date", fromDate)
    .lte("date", toDate)
    .order("date", { ascending: true });

  if (error) {
    throw new Error("Failed to retrieve visitor analytics data:", error);
  }
  return data;
}

export async function fetchAppointmentCountAnalytics() {
  const supabaseAdmin = await createServiceClient();

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const toDate = today.toISOString().slice(0, 10);
  const fromDate = yesterday.toISOString().slice(0, 10);

  const { count, error } = await supabaseAdmin
    .from("appointment")
    .select("*", { count: "exact", head: true })
    .lte("created_at", toDate)
    .gte("created_at", fromDate);

  if (error) {
    throw new Error(
      "Failed to retrieve appointment count analytics data :",
      error,
    );
  }

  return count ?? 0;
}

export async function fetchStudentRegisterCountAnalytics() {
  const supabaseAdmin = await createServiceClient();

  const { count, error } = await supabaseAdmin
    .from("student")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(
      "Failed to retrieve student register count analytics data :",
      error,
    );
  }

  return count ?? 0;
}

export async function fetchVisitorCountAnalytics() {
  const supabaseAdmin = await createServiceClient();

  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);

  const fromDate = monthAgo.toISOString().slice(0, 10);
  const toDate = today.toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("analytics_daily_visitor")
    .select("*")
    .gte("date", fromDate)
    .lte("date", toDate);

  const count = data?.reduce((acc, curr) => acc + curr.number_of_visitors, 0);

  if (error) {
    throw new Error("Failed to retrieve visitor count analytics data :", error);
  }

  return count ?? 0;
}
