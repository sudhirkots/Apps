const cacheName = "weekly-menu-generator-v4";
const appFiles = [
    "./",
    "./index.html",
    "./weekly_menu_generator.html",
    "./manifest.webmanifest",
    "./app-icon.svg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(appFiles))
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== cacheName).map(key => caches.delete(key))
        ))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
