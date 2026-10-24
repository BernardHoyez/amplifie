/* Amplifie – Service Worker (cache-bust / no long-term cache) */
const CACHE_NAME = 'amplifie-v' + Date.now(); // unique on every install → forces refresh

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients and delete ALL old caches (true cache-bust)
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy → always try network, fall back to cache only if offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Optionally put a fresh copy in cache (short-lived because CACHE_NAME changes)
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET' && response.ok) {
            cache.put(event.request, clone);
          }
        });
        return response;
      })
      .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
  );
});
