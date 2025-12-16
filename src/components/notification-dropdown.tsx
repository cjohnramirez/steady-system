"use client";

import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "@/hooks/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_dismissed: boolean;
  created_at: string;
  link: string | null;
}

export function NotificationDropdown() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.id);
  const router = useRouter();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("notification")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
      return data as Notification[];
    },
    enabled: !!userId,
  });

  // Dismiss notification
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notification")
        .update({ is_dismissed: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  // Dismiss all notifications
  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notification")
        .update({ is_dismissed: true })
        .eq("user_id", user.id)
        .eq("is_dismissed", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_dismissed).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_dismissed) {
      dismissMutation.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="p-2" variant="outline">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between p-4">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              onClick={() => dismissAllMutation.mutate()}
              variant="outline"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-4 text-center text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm">No notifications</div>
        ) : (

          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex cursor-pointer flex-col items-start border-b rounded-none ${
                !notification.is_dismissed ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex w-full items-start justify-between px-2 pt-2">
                <span className="font-medium">{notification.title}</span>
                {!notification.is_dismissed && (
                  <span className="bg-brand-normal h-2 w-2 rounded-full" />
                )}
              </div>
              <span className="text-sm px-2 ">{notification.message}</span>
              <span className="text-xs px-2 pb-2">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
