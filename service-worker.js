const CACHE_NAME = 'pomodohabit-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/pomodohabit-css.css',
  '/pomodohabit-init.js',
  '/pomodohabit-timer.js',
  '/pomodohabit-habits.js',
  '/pomodohabit-gamification.js',
  '/pomodohabit-app.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
