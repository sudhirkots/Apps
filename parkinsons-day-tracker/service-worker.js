/* Day Tracker service worker.
 * Precache the shell so the app opens with no connection. The doctor's video is
 * ~18 MB — it is cached at runtime on first play, never precached (BUILDSPEC §12).
 * Bump CACHE and the ?v= query strings together whenever an asset changes. */

var CACHE = "day-tracker-v8";

var SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=8",
  "./app.js?v=8",
  "./manifest.webmanifest?v=8",
  "./assets/fonts/caprasimo.woff2?v=8",
  "./assets/fonts/figtree-variable.woff2?v=8",
  "./assets/off-freezing.png",
  "./assets/on-standing.png",
  "./assets/extra-dyskinesia.png",
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

  // index.html carries no version string, so serving it cache-first would pin the
  // app to whichever app.js the stale document references — a new deploy would
  // never arrive. Navigations go network-first and fall back to cache offline.
  // Versioned assets (?v=N) stay cache-first: a new version is a new URL.
  var isNavigation = req.mode === "navigate" || url.pathname.endsWith("/index.html");

  if (isNavigation) {
    ev.respondWith(
      fetch(req)
        .then(function (res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(CACHE).then(function (cache) {
              cache.put("./index.html", copy);
            });
          }
          return res;
        })
        .catch(function () {
          return caches.match("./index.html").then(function (hit) {
            return hit || new Response("", { status: 504, statusText: "Offline" });
          });
        })
    );
    return;
  }

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
          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});
