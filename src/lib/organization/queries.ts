import type { DB } from "@/lib/db/types";
import { DbError } from "@/lib/db/error";

/** The guidance office's single profile row, readable signed out. */
export async function fetchOrganization(supabase: DB) {
  const { data, error } = await supabase
    .from("organization")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new DbError("Could not load office details", error);
  return data;
}

export async function fetchOrganizationContacts(supabase: DB) {
  const { data, error } = await supabase
    .from("organization_contact")
    .select("id, platform, contact_detail")
    .order("platform");
  if (error) throw new DbError("Could not load office contacts", error);
  return data;
}
