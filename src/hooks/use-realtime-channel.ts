"use client";

import { useEffect, useMemo, useRef } from "react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export type ChangePayload = RealtimePostgresChangesPayload<
  Record<string, unknown>
>;

const MAX_RETRY_DELAY = 30_000;

/**
 * Listens to inserts, updates and deletes on one table over Supabase Realtime.
 *
 * - **Unique channel per mount.** realtime-js hands back an existing channel when a
 *   topic is reused. A remounted navbar used to receive the channel its previous
 *   mount was still closing, attach a listener the server never heard about, and
 *   stay deaf until a full reload. That's why counselors didn't see new bookings.
 * - **Signed in first.** The session is read before joining; a channel joined as
 *   anon has every row filtered out by row-level security.
 * - **`onReady`** runs on every successful (re)subscribe and whenever the tab
 *   becomes visible again. Anything that happened while disconnected is caught up
 *   by refetching there.
 * - **Retries** with capped exponential backoff after a channel error or timeout.
 */
export function useRealtimeChannel({
  name,
  table,
  filter,
  onChange,
  onReady,
  enabled = true,
}: {
  /** Readable prefix for the channel topic, e.g. "notifications". */
  name: string;
  table: string;
  /** A Realtime filter such as `user_id=eq.<id>`. RLS still applies without it. */
  filter?: string;
  onChange: (payload: ChangePayload) => void;
  onReady?: () => void;
  enabled?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  // Callbacks live in refs so a new function each render doesn't resubscribe.
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onChangeRef.current = onChange;
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const drop = (target: RealtimeChannel | null) => {
      if (target) void supabase.removeChannel(target);
    };

    const connect = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      const handle = (payload: ChangePayload) => onChangeRef.current(payload);
      const base = { schema: "public", table } as const;
      const topic = supabase.channel(`${name}:${uniqueId()}`);

      // Supabase can't filter delete events, so with a filter a single "*" binding
      // never delivers deletes. Deletes are bound unfiltered instead; they carry
      // only the primary key, and handlers ignore ids they don't hold.
      const current = filter
        ? topic
            .on(
              "postgres_changes",
              { ...base, event: "INSERT", filter },
              handle,
            )
            .on(
              "postgres_changes",
              { ...base, event: "UPDATE", filter },
              handle,
            )
            .on("postgres_changes", { ...base, event: "DELETE" }, handle)
        : topic.on("postgres_changes", { ...base, event: "*" }, handle);
      channel = current;

      current.subscribe((status, error) => {
        // Ignore callbacks from a channel this hook has already replaced or closed.
        if (cancelled || channel !== current) return;

        if (status === "SUBSCRIBED") {
          attempt = 0;
          onReadyRef.current?.();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (error) console.warn(`Realtime ${name}:`, error.message);
          channel = null;
          drop(current);
          const delay = Math.min(MAX_RETRY_DELAY, 1000 * 2 ** attempt++);
          retryTimer = setTimeout(() => void connect(), delay);
        }
      });
    };

    void connect();

    const onVisible = () => {
      if (document.visibilityState === "visible") onReadyRef.current?.();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      document.removeEventListener("visibilitychange", onVisible);
      drop(channel);
      channel = null;
    };
  }, [supabase, name, table, filter, enabled]);
}

function uniqueId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
