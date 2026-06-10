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
