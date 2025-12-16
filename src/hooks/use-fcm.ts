"use client";

import { useEffect, useState, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/utils/firebase/config";
import { createClient } from "@/utils/supabase/client";
import { useUserStore } from "./auth-store";
import { toast } from "sonner";

interface FCMNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export function useFCM() {
  const supabase = createClient();
  const userId = useUserStore((state) => state.userId);
  const userRole = useUserStore((state) => state.userRole);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);

  // Save FCM token to Supabase
  const saveFCMToken = useCallback(async (token: string) => {
    if (!userId || !userRole) {
      console.log("Cannot save FCM token - missing userId or userRole:", { userId, userRole });
      return;
    }

    console.log("Saving FCM token for user:", userId);
    const { error } = await supabase.from("fcm_token").upsert(
      {
        user_id: userId,
        token: token,
        role: userRole,
        device_info: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" }
    );

    if (error) {
      console.error("Error saving FCM token:", error);
    }
  }, [userId, userRole, supabase]);

  // Request notification permission and get FCM token
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !userId) {
      console.log("Cannot request permission - userId:", userId);
      return null;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== "granted") {
        console.log("Notification permission denied");
        return null;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) return null;

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        setFcmToken(token);
        // Save token to Supabase
        await saveFCMToken(token);
        return token;
      }
    } catch (error) {
      console.error("Error getting FCM token:", error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [userId, saveFCMToken]);

  // Remove FCM token (on logout)
  const removeFCMToken = useCallback(async () => {
    if (!fcmToken || !userId) return;

    const { error } = await supabase
      .from("fcm_token")
      .delete()
      .eq("user_id", userId)
      .eq("token", fcmToken);

    if (error) {
      console.error("Error removing FCM token:", error);
    }
    setFcmToken(null);
  }, [fcmToken, userId, supabase]);

  // Listen for foreground messages
  useEffect(() => {
    if (typeof window === "undefined") return;

    let unsubscribe: (() => void) | undefined;

    const setupForegroundListener = async () => {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);

        const notification: FCMNotification = {
          title: payload.notification?.title || "New Notification",
          body: payload.notification?.body || "",
          data: payload.data,
        };

        // Show toast notification
        toast(notification.title, {
          description: notification.body,
          action: notification.data?.link
            ? {
                label: "View",
                onClick: () => {
                  window.location.href = notification.data!.link!;
                },
              }
            : undefined,
        });
      });
    };

    setupForegroundListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Auto-request permission when user is logged in
  useEffect(() => {
    if (userId && userRole && notificationPermission === "default") {
      // Small delay to not block initial render
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userId, userRole, notificationPermission, requestPermission]);

  return {
    fcmToken,
    notificationPermission,
    isLoading,
    requestPermission,
    removeFCMToken,
  };
}
