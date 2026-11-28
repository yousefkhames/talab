const CACHE = 'talab-v1';
const FILES = ['./','index.html','manifest.webmanifest','base.css','kit-base.js','fonts/fonts.css','fonts/Cairo-arabic.woff2','fonts/Cairo-latin.woff2','assets/kit-theme.js','assets/qrcode.js','assets/yk-logo.svg','assets/favicon.svg','catalog-data.js','shop-core.js','shop-i18n.js','i18n.js','shop-ui.js','app.js','shop.css'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => /^talab-v\d+$/.test(k) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const url = new URL(e.request.url);
  if (!FILES.some((file) => new URL(file, self.registration.scope).pathname === url.pathname)) return;
  const request = new Request(url.origin + url.pathname);
  e.respondWith((async () => {
    try {
      const response = await fetch(e.request);
      if (response.ok) { try { await (await caches.open(CACHE)).put(request, response.clone()); } catch { /* cache unavailable */ } return response; }
      return response.status >= 500 ? (await (await caches.open(CACHE)).match(request)) || response : response;
    } catch { return (await (await caches.open(CACHE)).match(request)) || new Response('Offline', { status: 503 }); }
  })());
});
