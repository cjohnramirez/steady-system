"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import {
  deleteNotification,
  fetchNotificationFeed,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
  type NotificationFeed,
} from "@/lib/notifications/queries";

/**
 * The signed-in user's notifications, kept live over Supabase Realtime.
 *
 * Rows are only ever inserted by database triggers, so a new row arriving on the
 * channel means something happened to this user: it is added to the cache and
 * shown as a toast. Row-level security applies to Realtime too, so the filter is a
 * bandwidth saving, not the access control.
 */
export function useNotifications(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const router = useRouter();
  const key = queryKeys.notifications.all(userId);

  const feed = useQuery({
    queryKey: key,
    queryFn: () => fetchNotificationFeed(supabase, userId),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // The browser client reads the session from cookies asynchronously. Joining the
    // channel before handing Realtime the access token subscribes as anon, and
    // row-level security then filters out every notification.
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notification",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const item = payload.new as Notification;

            queryClient.setQueryData<NotificationFeed>(key, (current) =>
              current
                ? {
                    items: [item, ...current.items].slice(0, 20),
                    unread: current.unread + 1,
                  }
                : current,
            );

            // The event usually means an appointment changed, so any open list of
            // appointments is out of date too.
            if (item.type === "appointment") {
              void queryClient.invalidateQueries({
                queryKey: queryKeys.appointments.all,
              });
            }

            toast(item.title, {
              description: item.body,
              action: item.link
                ? { label: "View", onClick: () => router.push(item.link!) }
                : undefined,
            });
          },
        )
        .subscribe((status, error) => {
          if (error)
            console.warn("Notifications channel:", status, error.message);
        });
    });

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
    // `key` is derived from userId; listing it would resubscribe every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, queryClient, router, userId]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(supabase, id),
    onMutate: (id) => {
      queryClient.setQueryData<NotificationFeed>(key, (current) => {
        if (!current) return current;
        const target = current.items.find((n) => n.id === id);
        if (!target || target.read_at) return current;
        return {
          items: current.items.map((n) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
          ),
          unread: Math.max(0, current.unread - 1),
        };
      });
    },
    onError: () => void refresh(),
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsRead(supabase, userId),
    onMutate: () => {
      const now = new Date().toISOString();
      queryClient.setQueryData<NotificationFeed>(key, (current) =>
        current
          ? {
              items: current.items.map((n) => ({
                ...n,
                read_at: n.read_at ?? now,
              })),
              unread: 0,
            }
          : current,
      );
    },
    onError: () => {
      toast.error("Could not mark notifications as read.");
      void refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteNotification(supabase, id),
    onSuccess: () => void refresh(),
    onError: () => toast.error("Could not remove the notification."),
  });

  return { feed, markRead, markAllRead, remove };
}
