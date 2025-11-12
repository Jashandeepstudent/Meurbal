// ===========================================
// 🌌 MEURBAL SERVICE WORKER v1.1
// ===========================================

const CACHE_NAME = 'meurbal-cache-v1';
const ASSETS_TO_CACHE = [
  './',                // root
  './index.html',      // main entry
  './meurbal2.html',   // optional if this is your main app file
  './melogo.png',      // icons
  './manifest.json',
  // You can add more static files if needed:
  // './styles.css',
  // './app.js',
];

// 🧱 INSTALL EVENT
self.addEventListener('install', (event) => {
  console.log('📥 [Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ [Service Worker] Caching core assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 🚀 ACTIVATE EVENT
self.addEventListener('activate', (event) => {
  console.log('♻️ [Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 🌐 FETCH EVENT
self.addEventListener('fetch', (event) => {
  // Skip requests that aren’t HTTP (like chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache
        return cachedResponse;
      }

      // Otherwise, fetch from network and cache it for future
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache successful responses
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
        .catch(() => {
          // 🧭 Optional fallback for offline usage
          return caches.match('./index.html');
        });
    })
  );
});

// 🆕 LISTEN FOR SKIP_WAITING MESSAGE (optional for updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
