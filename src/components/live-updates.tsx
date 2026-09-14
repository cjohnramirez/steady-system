"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import { queryKeys } from "@/lib/query-keys";

const DEBOUNCE_MS = 300;

/**
 * Keeps appointment lists, counts, free slots and the admin dashboard current
 * while the page is open.
 *
 * Mounted once per signed-in area. Row-level security scopes the events: a student
 * hears about their own appointments, a counselor about theirs, an admin about
 * all. Lists used to refresh only when a notification happened to arrive, so an
 * admin, who gets no appointment notifications, never saw changes without a reload.
 */
export function LiveUpdates() {
  const queryClient = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const subscribed = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const refresh = () => {
    // A burst of changes (one update fires several events) becomes one refetch.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.availableSlots.all,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    }, DEBOUNCE_MS);
  };

  useRealtimeChannel({
    name: "appointments",
    table: "appointment",
    onChange: refresh,
    // The first subscribe follows the page's own fetch; only reconnects and a
    // returning tab need to catch up.
    onReady: () => {
      if (subscribed.current) refresh();
      subscribed.current = true;
    },
  });

  return null;
}
