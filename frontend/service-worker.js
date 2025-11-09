const CACHE_NAME = 'caloriesnap-v1.0.0';
const urlsToCache = [
  '/',
  '/app.js',
  '/camera.js',
  '/styles.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        // For API calls, always try network first
        if (event.request.url.includes('/api/')) {
          return fetch(event.request).catch(() => {
            // Return offline response for API calls
            return new Response(
              JSON.stringify({
                success: false,
                error: {
                  code: 'OFFLINE',
                  message: 'No internet connection. Please check your network.',
                  retryable: true
                }
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        }

        // For other requests, fallback to cache or network
        return fetch(event.request).catch(() => {
          // Return cached page for offline navigation
          return caches.match('/').then(response => {
            return response || new Response('Offline - No cached content available', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
      })
  );
});

// Activate event - clean up old caches
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
    })
  );
});