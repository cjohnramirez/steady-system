import { createClient } from "@/utils/supabase/client";

export async function fetchOrganization() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("organization")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch organization: ${error.message}`);
  }

  return data;
}
