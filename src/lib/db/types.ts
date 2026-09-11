import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * The Supabase client, carrying the generated schema.
 *
 * Always use this instead of a bare `SupabaseClient`. Without the type parameter
 * every `.from()` result degrades to `any`, which silently switches off type
 * checking across the whole query layer: at one point `appointment.status` was
 * changed from free text to a database enum and not one of the hardcoded status
 * strings in the UI produced an error, because none of them were being checked.
 */
export type DB = SupabaseClient<Database>;
