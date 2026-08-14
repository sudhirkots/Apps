const CACHE_NAME = "daytracker-v3";

// The shell only. The doctor's video is 18 MB — precaching it would stall
// the install on a slow connection, so it is cached on first play instead.
const ASSETS = [
  "./",
  "index.html",
  "styles.css?v=2",
  "app.js?v=3",
  "manifest.webmanifest",
  "assets/red-freezing.png",
  "assets/green-dyskinesia.png",
  "assets/yellow-standing.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/fonts/caprasimo.woff2",
  "assets/fonts/figtree-variable.woff2"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Range requests (the video scrubbing) return 206 and cannot be cached.
        if (response.ok && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
