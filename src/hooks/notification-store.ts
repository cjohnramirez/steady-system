"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export function NotificationListener({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { title, message } = payload.new as any;

          toast(title, { description: message });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return null;
}
