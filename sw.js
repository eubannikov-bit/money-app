const CACHE_NAME = 'money-app-v2';
const URLS_TO_CACHE = [
  '/money-app/',
  '/money-app/index.html',
  '/money-app/manifest.json',
  '/money-app/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone)).catch(() => {});
        return resp;
      }).catch(() => caches.match('/money-app/index.html'));
    })
  );
});
