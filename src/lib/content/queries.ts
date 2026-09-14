import type { DB } from "@/lib/db/types";
import { DbError } from "@/lib/db/error";
import { pageRange, searchPattern, toPage } from "@/lib/db/paginate";

export type ContentListParams = {
  page: number;
  pageSize: number;
  search?: string;
};

/**
 * Public content reads. They take a client so the same function serves server
 * components (home page) and client lists (portal, admin CMS).
 */

export async function fetchArticles(
  supabase: DB,
  {
    page,
    pageSize,
    search,
    emotionalStatusId,
  }: ContentListParams & { emotionalStatusId?: string },
) {
  const { from, to } = pageRange(page, pageSize);
  let query = supabase.from("article").select("*", { count: "exact" });

  const pattern = searchPattern(search);
  if (pattern)
    query = query.or(
      `title.ilike.${pattern},author_name.ilike.${pattern},content.ilike.${pattern}`,
    );
  // A mood with no articles returns an empty page. The old code quietly swapped in
  // unfiltered results for that page, mixing the two lists across pages.
  if (emotionalStatusId)
    query = query.eq("emotional_status_id", emotionalStatusId);

  return toPage(
    query.order("added_at", { ascending: false }).order("id").range(from, to),
    "Could not load articles",
  );
}

export async function fetchPlaylists(
  supabase: DB,
  {
    page,
    pageSize,
    search,
    emotionalStatusId,
  }: ContentListParams & { emotionalStatusId?: string },
) {
  const { from, to } = pageRange(page, pageSize);
  let query = supabase
    .from("playlist_with_details")
    .select("*", { count: "exact" });

  const pattern = searchPattern(search);
  if (pattern)
    query = query.or(`title.ilike.${pattern},creator.ilike.${pattern}`);
  if (emotionalStatusId)
    query = query.eq("emotional_status_id", emotionalStatusId);

  return toPage(
    query.order("title").order("id").range(from, to),
    "Could not load playlists",
  );
}

/**
 * `upcoming` lists events that have not ended yet, soonest first. The old portal
 * filter asked for events that had already started, so upcoming events never
 * appeared, and it compared date-only strings, so an event ending later today
 * disappeared at midnight UTC.
 */
export async function fetchAnnouncements(
  supabase: DB,
  {
    page,
    pageSize,
    search,
    when = "all",
  }: ContentListParams & { when?: "upcoming" | "past" | "all" },
) {
  const { from, to } = pageRange(page, pageSize);
  const now = new Date().toISOString();
  let query = supabase.from("announcement").select("*", { count: "exact" });

  const pattern = searchPattern(search);
  if (pattern)
    query = query.or(
      `title.ilike.${pattern},location.ilike.${pattern},description.ilike.${pattern}`,
    );
  if (when === "upcoming") query = query.gte("end_date", now);
  if (when === "past") query = query.lt("end_date", now);

  return toPage(
    query
      .order("start_date", { ascending: when === "upcoming" })
      .order("id")
      .range(from, to),
    "Could not load announcements",
  );
}

export async function fetchMoodByName(supabase: DB, name: string | null) {
  if (!name) return null;
  const { data, error } = await supabase
    .from("emotional_status")
    .select("id, name")
    .eq("name", name)
    .maybeSingle();
  if (error) throw new DbError("Could not load moods", error);
  return data;
}
