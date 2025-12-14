import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchLatestAnnouncement(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("announcement")
    .select("*")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function fetchLatestArticle(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("article")
    .select("*")
    .order("title", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function fetchAnnouncementsByDate(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string,
  daysFromNow: number,
) {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - daysFromNow);

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const fromDate = past.toISOString().slice(0, 10);
  const toDate = now.toISOString().slice(0, 10);

  let query = supabase
    .from("announcement")
    .select("*", { count: "exact" })
    .lte("start_date", toDate)
    .gte("end_date", fromDate);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("start_date", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}

export async function fetchArticlesByEmotion(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string,
  emotionalStatus: string,
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("article").select("*", { count: "exact" });

  if (emotionalStatus !== "") {
    const { data: statusData, error: statusError } = await supabase
      .from("emotional_status")
      .select("id")
      .eq("name", emotionalStatus.toLowerCase())
      .maybeSingle();

    if (statusError) throw statusError;
    if (statusData) {
      query = query.eq("emotional_status_id", statusData.id);
    }
  }

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

export async function fetchPlaylistByEmotion(
  supabase: SupabaseClient,
  page: number,
  pageSize: number,
  search: string,
  emotionalStatus: string,
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("playlist_with_details")
    .select("*", { count: "exact" });

  if (emotionalStatus !== "") {
    const { data: statusData, error: statusError } = await supabase
      .from("emotional_status")
      .select("id")
      .eq("name", emotionalStatus.toLowerCase())
      .maybeSingle();

    if (statusError) throw statusError;
    if (statusData) {
      query = query.eq("emotional_status_id", statusData.id);
    }
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query
    .order("title", {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}
