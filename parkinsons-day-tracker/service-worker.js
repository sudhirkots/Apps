/* Day Tracker service worker.
 * Precache the shell so the app opens with no connection. The doctor's video is
 * ~18 MB — it is cached at runtime on first play, never precached (BUILDSPEC §12).
 * Bump CACHE and the ?v= query strings together whenever an asset changes. */

var CACHE = "day-tracker-v1";

var SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=1",
  "./app.js?v=1",
  "./manifest.webmanifest?v=1",
  "./assets/fonts/caprasimo.woff2?v=1",
  "./assets/fonts/figtree-variable.woff2?v=1",
  "./assets/red-freezing.png",
  "./assets/yellow-standing.png",
  "./assets/green-dyskinesia.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (k) {
          return k === CACHE ? null : caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // The video is range-requested; let the network handle it and cache opportunistically.
  var isVideo = url.pathname.indexOf("doctor-intro.mp4") !== -1;

  ev.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req)
        .then(function (res) {
          if (isVideo || !res || res.status !== 200 || res.type !== "basic") return res;
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
          return res;
        })
        .catch(function () {
          // Offline and not cached: fall back to the shell for navigations.
          if (req.mode === "navigate") return caches.match("./index.html");
          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});
