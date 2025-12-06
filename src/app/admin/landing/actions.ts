import { TablesInsert, TablesUpdate } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchArticles(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string = "",
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("article").select("*", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("title", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}

export async function fetchPlaylist(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string = "",
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("playlist_with_details")
    .select("*", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("title", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}

export async function fetchAnnouncements(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string = "",
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("announcement").select("*", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("title", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}

// add announcement
export async function insertAnnouncement(
  values: TablesInsert<"announcement">,
) {
  const supabase = createClient()

  const { error } = await supabase.from("announcement").insert({
    values,
  });

  if (error) throw new Error(String(error));
}

// add playlist
export async function insertPlaylist(
  values: TablesInsert<"playlist">,
) {
  const supabase = createClient()

  const { error } = await supabase.from("playlist").insert({
    values,
  });

  if (error) throw new Error(String(error));
}

// add articles
export async function insertArticle(
  values: TablesInsert<"article">,
) {
  const supabase = createClient()

  const { error } = await supabase.from("article").insert({
    values,
  });

  if (error) throw new Error(String(error));
}

// update announcement
export async function updateAppointment(
  supabase: SupabaseClient,
  id: string,
  values: TablesUpdate<"appointment">,
) {
  const { error } = await supabase
    .from("appointment")
    .update({ values })
    .eq("id", id)
    .single();

  if (error) throw new Error(String(error));
}

// update playlist
export async function updatePlaylist(
  supabase: SupabaseClient,
  id: string,
  values: TablesUpdate<"playlist">,
) {
  const { error } = await supabase
    .from("playlist")
    .update({ values })
    .eq("id", id)
    .single();

  if (error) throw new Error(String(error));
}

// update articles
export async function updateArticle(
  supabase: SupabaseClient,
  id: string,
  values: TablesUpdate<"article">,
) {
  const { error } = await supabase
    .from("article")
    .update({ values })
    .eq("id", id)
    .single();

  if (error) throw new Error(String(error));
}
