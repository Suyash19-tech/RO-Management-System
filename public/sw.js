// Sardarji RO - Minimal Service Worker (Bypass to Network)
// This SW exists purely to satisfy PWA installation requirements.
// Next.js App Router handles its own caching, routing, and prefetching,
// so intercepting requests here causes lagging and breaks dynamic pages.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Completely bypass the service worker and let the browser/Next.js handle it normally.
  // This prevents any lag during client-side routing and fixes API failures.
  return;
});

// Listen for push notifications from the backend
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      data: {
        url: data.url || '/'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});
