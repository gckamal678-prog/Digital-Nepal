const CACHE_NAME = 'digital-notebook-v1';
const urlsToCache = [
  'index.html',
  'add-transaction.html',
  'add-income.html',
  'add-saving.html',
  'calculate.html',
  'calendar.html',
  'notebook.html',
  'qrscan.html',
  'setting.html',
  'account.html',
  'N1024.png',
  'manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch & Serve from Cache when Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
