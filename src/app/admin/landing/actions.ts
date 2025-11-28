import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchArticles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("article")
    .select(`*`)
    .range(0, 3);

  if (error) throw new Error("Error fetching articles: ", error);
  return data || [];
}

export async function fetchPlaylist(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("playlist_with_details")
    .select(`*`)
    .range(0, 3);

  if (error) throw new Error("Error fetching playlists: ", error);
  return data || [];
}

export async function fetchAnnouncements(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("announcement")
    .select(`*`)
    .range(0, 3);

  if (error) throw new Error("Error fetching announcements: ", error);
  return data || [];
}