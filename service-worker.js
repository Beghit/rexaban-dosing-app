const CACHE_NAME = 'rexaban-cache-v1'; // You can update 'v1' to 'v2', 'v3', etc., to force a cache update
const urlsToCache = [
  './', // Caches the root URL, which typically serves index.html
  './index.html', // Explicitly caches index.html
  './afric.png',  // IMPORTANT: Adjust 'afric.png' to 'Afric.png' if your file has a capital 'A'
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' // Caches Font Awesome
  // Add paths to any other local CSS, JavaScript, or image files here, e.g.:
  // './your-styles.css',
  // './your-scripts.js',
  // './another-image.jpg'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        // Optionally, return an offline page or error page here
        // return caches.match('/offline.html');
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new service worker...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
