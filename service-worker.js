const CACHE_NAME = 'beast-mode-v2'; // ⚠️ Changed version to force update
const urlsToCache = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=JetBrains+Mono:wght@400;600&display=swap'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force activation
  );
});

// Network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control immediately
  );
});
