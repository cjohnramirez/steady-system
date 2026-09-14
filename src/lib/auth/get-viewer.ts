import "server-only";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { fetchViewer, type Viewer } from "./viewer";

/**
 * The signed-in viewer for this request, or null.
 *
 * Wrapped in `cache` so a layout, its page and a nested layout share one lookup per
 * request instead of each asking the auth server again.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  return fetchViewer(supabase);
});
