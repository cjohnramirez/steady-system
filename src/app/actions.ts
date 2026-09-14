"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Counts one visit.
 *
 * Anonymous visitors are the point, so there is no auth check here. There is also
 * no service-role key: `increment_daily_visitor` is a security-definer function
 * with execute granted to anon.
 */
export async function updateAnalytics() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_daily_visitor");

  if (error) {
    // A missed page view is not worth breaking a page render over.
    console.warn("Visitor analytics update failed:", error.message);
  }
}
