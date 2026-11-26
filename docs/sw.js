// Talab service worker: cache-first for app shell, network fallback.
const CACHE = "talab-v3";
const SHELL = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app.js",
  "./js/core/format.js",
  "./js/core/i18n.js",
  "./js/core/store.js",
  "./js/core/whatsapp.js",
  "./js/core/demo.js",
  "./js/views/shop.js",
  "./js/views/cart.js",
  "./js/views/seller.js",
  "./js/views/seller-orders.js",
  "./js/views/seller-settings.js",
  "./js/views/seller-share.js",
  "./fonts/Cairo-arabic-400.woff2",
  "./fonts/Cairo-arabic-600.woff2",
  "./fonts/Cairo-arabic-700.woff2",
  "./fonts/Cairo-arabic-800.woff2",
  "./fonts/Cairo-latin-400.woff2",
  "./fonts/Cairo-latin-600.woff2",
  "./fonts/Cairo-latin-700.woff2",
  "./fonts/Cairo-latin-800.woff2",
  "./fonts/fonts.css",
  "./assets/logo.svg",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          if (res.ok && new URL(e.request.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
    )
  );
});
