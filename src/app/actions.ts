"use server";

import { createServiceClient } from "@/utils/supabase/service";

export async function updateAnalytics() {
  const supabaseAdmin = await createServiceClient();

  const { error } = await supabaseAdmin.rpc("increment_daily_visitor");

  if (error) throw new Error("Error incrementing visitors: " + error.message);
}
