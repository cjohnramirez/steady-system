import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

export async function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // server-only key
    {
      cookies: {
        getAll: () => [],
        setAll: () => {}, // no-op
      },
    },
  );
}
