import "server-only";
import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env/server";
import { Database } from "@/types/supabase";

/**
 * Service-role client. Bypasses row-level security completely.
 *
 * Rules for using it, in order of importance:
 *   1. Never import this from a client component. The key is server-only.
 *   2. Call `requireRole("admin")` from `@/lib/auth/session` before you touch it,
 *      unless every query you are about to run is already scoped to the caller's
 *      own `auth.uid()`.
 *   3. Prefer the ordinary server client. If a query works under row-level
 *      security, it does not belong here.
 *
 * A "use server" module is a network endpoint. Anything in one that uses this
 * client without a role check is reachable by anyone who can guess the action id.
 *
 * This is a plain supabase-js client rather than an SSR one on purpose: it must
 * never read or write session cookies, because that is how a `signUp` call made
 * on behalf of an admin ended up replacing the admin's own session.
 */
export function createServiceClient() {
  return createClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
