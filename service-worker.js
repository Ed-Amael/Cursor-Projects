const CACHE_NAME = 'aurasat-static-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/coverage.html',
  '/weather.html',
  '/speedtest.html',
  '/plans.html',
  '/support.html',
  '/assets/css/styles.css',
  '/assets/js/main.js',
  '/assets/img/logo.svg',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(OFFLINE_URL));
    })
  );
});