import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";


export async function fetchPlaylist(
  id: string
): Promise<Tables<"playlist">> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("playlist")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(String(error));
  return data;
}

export async function fetchArticle(
  id: string
): Promise<Tables<"article">> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("article")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(String(error));
  return data;
}

export async function fetchAnnouncement(
  id: string
): Promise<Tables<"announcement">> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("announcement")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(String(error));
  return data;
}

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

export async function fetchPlaylists(
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
export async function updateAnnouncement(
  values: TablesUpdate<"announcement">,
) {
  const supabase = createClient()

  const { error } = await supabase
    .from("announcement")
    .update(values)
    .eq("id", values.id)
    .single();

  if (error) throw new Error(String(error));
}

// update playlist
export async function updatePlaylist(
  values: TablesUpdate<"playlist">,
) {
  const supabase = createClient()

  const { error } = await supabase
    .from("playlist")
    .update({ values })
    .eq("id", values.id)
    .single();

  if (error) throw new Error(String(error));
}

export async function updateArticle(
  values: TablesUpdate<"article">,
) {
  const supabase = createClient()

  const { error } = await supabase
    .from("article")
    .update({ values })
    .eq("id", values.id)
    .single();

  if (error) throw new Error(String(error));
}
