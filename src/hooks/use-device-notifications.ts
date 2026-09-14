"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notification } from "@/lib/notifications/queries";

export type DevicePermission = "unsupported" | "default" | "granted" | "denied";

const ICON = "/icons/192";

function isIosBrowserTab() {
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

/**
 * System notifications while Steady is open in a background tab or window.
 *
 * Permission is only requested from a click (`enable`), which browsers require and
 * people expect. Notifications go through the service worker in `public/sw.js`, the
 * only way that works on Android and on an iPhone home-screen app. Safari on iOS
 * has no notifications in a normal tab, which `needsHomeScreen` reports so the UI
 * can explain.
 */
export function useDeviceNotifications() {
  const router = useRouter();
  const [permission, setPermission] = useState<DevicePermission>("unsupported");
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setNeedsHomeScreen(!supported && isIosBrowserTab());
    if (!supported) return;

    setPermission(Notification.permission);
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration.current = reg;
      })
      .catch((error: unknown) =>
        console.warn("Service worker not registered:", error),
      );

    // A notification clicked while this tab is open asks the page to navigate.
    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "navigate" &&
        typeof event.data.link === "string"
      )
        router.push(event.data.link);
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    // Permission can change in browser settings while the page is open.
    let status: PermissionStatus | null = null;
    const sync = () => setPermission(Notification.permission);
    navigator.permissions
      ?.query({ name: "notifications" })
      .then((result) => {
        status = result;
        result.addEventListener("change", sync);
      })
      .catch(() => {});

    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
      status?.removeEventListener("change", sync);
    };
  }, [router]);

  const enable = useCallback(async () => {
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        const reg =
          registration.current ?? (await navigator.serviceWorker.ready);
        await reg.showNotification("Device notifications are on", {
          body: "You'll hear about appointment updates while Steady is open.",
          icon: ICON,
          tag: "steady-enabled",
        });
      }
    } finally {
      setRequesting(false);
    }
  }, []);

  /**
   * Shows a system notification when the page is hidden and permission is granted.
   * Returns whether it did, so a visible page can show a toast instead.
   */
  const show = useCallback(
    (item: Notification) => {
      const reg = registration.current;
      if (
        permission !== "granted" ||
        !reg ||
        document.visibilityState !== "hidden"
      )
        return false;

      void reg.showNotification(item.title, {
        body: item.body,
        icon: ICON,
        tag: item.id,
        data: { link: item.link ?? "/home" },
      });
      return true;
    },
    [permission],
  );

  return { permission, needsHomeScreen, requesting, enable, show };
}
