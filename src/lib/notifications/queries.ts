import type { DB } from "@/lib/db/types";
import type { Tables } from "@/types/supabase";
import { DbError } from "@/lib/db/error";

export type Notification = Tables<"notification">;

export type NotificationFeed = {
  items: Notification[];
  unread: number;
};

import { FEED_SIZE } from "./feed";

/**
 * The latest notifications plus a separate unread count.
 *
 * The count is its own head query because the December bell counted unread items
 * inside the ten rows it had loaded, so an eleventh unread notification vanished
 * from the badge.
 */
export async function fetchNotificationFeed(
  supabase: DB,
  userId: string,
): Promise<NotificationFeed> {
  const [list, unread] = await Promise.all([
    supabase
      .from("notification")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(FEED_SIZE),
    supabase
      .from("notification")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);

  if (list.error) throw new DbError("Could not load notifications", list.error);
  if (unread.error)
    throw new DbError("Could not count notifications", unread.error);

  return { items: list.data, unread: unread.count ?? 0 };
}

export async function markNotificationRead(supabase: DB, id: string) {
  const { error } = await supabase
    .from("notification")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) throw new DbError("Could not update the notification", error);
}

export async function markAllNotificationsRead(supabase: DB, userId: string) {
  const { error } = await supabase
    .from("notification")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
  if (error) throw new DbError("Could not update notifications", error);
}

export async function deleteNotification(supabase: DB, id: string) {
  const { error } = await supabase.from("notification").delete().eq("id", id);
  if (error) throw new DbError("Could not remove the notification", error);
}
