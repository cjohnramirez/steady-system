"use client";

import { useEffect } from "react";
import { useFCM } from "@/hooks/use-fcm";

/**
 * FCM Provider Component
 * Add this to your root layout to automatically initialize FCM
 * when the user is logged in
 */
export function FCMProvider({ children }: { children: React.ReactNode }) {
  const { requestPermission, notificationPermission } = useFCM();

  useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("FCM Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("FCM Service Worker registration failed:", error);
        });
    }
  }, []);

  return <>{children}</>;
}
