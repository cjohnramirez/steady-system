// Steady's service worker. It only exists to show device notifications and to open
// the right page when one is clicked. It caches nothing, so the site never serves
// stale pages from it.
//
// Browsers need a service worker for notifications: Android Chrome refuses
// `new Notification()` outright, and an iPhone home-screen app only gets them this way.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/home";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const open = windows.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );

      if (open) {
        await open.focus();
        // The page navigates itself, so it's a normal in-app route change.
        open.postMessage({ type: "navigate", link });
        return;
      }
      await self.clients.openWindow(new URL(link, self.location.origin).href);
    })(),
  );
});
