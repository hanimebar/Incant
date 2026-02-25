const CACHE = 'incant-v1';

// Precache the app shell on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(['/', '/cast', '/manifest.json', '/icon-192.png', '/icon-512.png'])
    )
  );
  self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip: non-GET, API routes, Next.js build chunks (browser cache handles those)
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/')) return;

  // Network-first: serve fresh content, fall back to cache when offline
  e.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
