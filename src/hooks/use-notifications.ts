"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  addToFeed,
  applyUpdate,
  removeFromFeed,
} from "@/lib/notifications/feed";
import {
  deleteNotification,
  fetchNotificationFeed,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
  type NotificationFeed,
} from "@/lib/notifications/queries";
import { useRealtimeChannel } from "./use-realtime-channel";

/**
 * The signed-in user's notifications, kept live over Supabase Realtime.
 *
 * Rows are only inserted by database triggers, so an insert means something
 * happened to this user: it joins the feed and shows as a toast (or a device
 * notification, via `onArrive`, when the tab is in the background). Updates and
 * deletes keep other tabs in step when a notification is read or removed.
 */
export function useNotifications(
  userId: string,
  { onArrive }: { onArrive?: (item: Notification) => boolean } = {},
) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const router = useRouter();
  const key = queryKeys.notifications.all(userId);

  const feed = useQuery({
    queryKey: key,
    queryFn: () => fetchNotificationFeed(supabase, userId),
    staleTime: 5 * 60 * 1000,
  });

  const edit = (update: (current: NotificationFeed) => NotificationFeed) =>
    queryClient.setQueryData<NotificationFeed>(key, (current) =>
      current ? update(current) : current,
    );

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  useRealtimeChannel({
    name: "notifications",
    table: "notification",
    filter: `user_id=eq.${userId}`,
    // Catch up on anything sent while the channel was down or the tab was hidden.
    onReady: () => void refresh(),
    onChange: (payload) => {
      if (payload.eventType === "INSERT") {
        const item = payload.new as Notification;
        edit((current) => addToFeed(current, item));

        // A background tab gets a device notification instead of a toast.
        if (onArrive?.(item)) return;
        toast(item.title, {
          id: item.id,
          description: item.body,
          action: item.link
            ? { label: "View", onClick: () => router.push(item.link!) }
            : undefined,
        });
      } else if (payload.eventType === "UPDATE") {
        edit((current) => applyUpdate(current, payload.new as Notification));
      } else if (payload.eventType === "DELETE") {
        const id = (payload.old as Partial<Notification>).id;
        if (id) edit((current) => removeFromFeed(current, id));
      }
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(supabase, id),
    onMutate: (id) => {
      edit((current) => {
        const target = current.items.find((n) => n.id === id);
        return target
          ? applyUpdate(current, {
              ...target,
              read_at: new Date().toISOString(),
            })
          : current;
      });
    },
    onError: () => void refresh(),
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(supabase, userId),
    onMutate: () => {
      const now = new Date().toISOString();
      edit((current) => ({
        items: current.items.map((n) => ({ ...n, read_at: n.read_at ?? now })),
        unread: 0,
      }));
    },
    onError: () => {
      toast.error("Could not mark notifications as read.");
      void refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteNotification(supabase, id),
    onSuccess: (_data, id) => edit((current) => removeFromFeed(current, id)),
    onError: () => toast.error("Could not remove the notification."),
  });

  return { feed, markRead, markAllRead, remove };
}
