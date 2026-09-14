import { z } from "zod";
import type { DB } from "@/lib/db/types";
import { DbError } from "@/lib/db/error";

const pointSchema = z.object({
  date: z.string(),
  visitors: z.number(),
  logins: z.number(),
  appointments: z.number(),
});

const statsSchema = z.object({
  today: z.string(),
  students: z.number(),
  counselors: z.number(),
  appointments_today: z.number(),
  pending_appointments: z.number(),
  visitors_30d: z.number(),
  series: z.array(pointSchema),
});

export type DashboardStats = z.infer<typeof statsSchema>;
export type DashboardPoint = z.infer<typeof pointSchema>;

export function parseDashboardStats(value: unknown): DashboardStats {
  return statsSchema.parse(value);
}

export function lastDays(series: DashboardPoint[], days: number) {
  return series.slice(-days);
}

/** Every dashboard figure in one call to admin_dashboard_stats, bucketed on Manila days. */
export async function fetchDashboardStats(supabase: DB) {
  const { data, error } = await supabase.rpc("admin_dashboard_stats", {
    p_days: 90,
  });
  if (error) throw new DbError("Could not load the dashboard", error);
  return parseDashboardStats(data);
}
