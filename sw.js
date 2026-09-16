const CACHE_NAME = 'digital-notebook-v2';
const urlsToCache = [
  './',
  './index.html',
  './add-transaction.html',
  './add-income.html',
  './add-saving.html',
  './calculate.html',
  './calendar.html',
  './notebook.html',
  './qrscan.html',
  './setting.html',
  './account.html',
  './N1024.png',
  './manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch & Serve from Cache when Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // यदि अफलाइन हुँदा कुनै पेज फेला परेन भने index.html देखाउने
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
