// Firebase Messaging Service Worker
// This runs in the background to handle push notifications

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDnEBMx9tojbUTgOg_LiXg3DCSEVMaklkc",
  authDomain: "gcs-system-c2d72.firebaseapp.com",
  projectId: "gcs-system-c2d72",
  storageBucket: "gcs-system-c2d72.firebasestorage.app",
  messagingSenderId: "443524543106",
  appId: "1:443524543106:web:3686a26806bb94515f3a9b",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: payload.data?.id || "default",
    data: payload.data,
    actions: payload.data?.link
      ? [{ action: "open", title: "View" }]
      : [],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click:", event);
  event.notification.close();

  const link = event.notification.data?.link || "/";
  
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(link);
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
      })
  );
});
