/ Service Worker für Checklisten App (GitHub Pages Version)
const CACHE_NAME = 'checklist-app-v1';
const urlsToCache = [
  '/checklisten-app/',
  '/checklisten-app/index.html',
  '/checklisten-app/manifest.json',
  '/checklisten-app/icon-192.png',
  '/checklisten-app/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache und Netzwerk-Strategie
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Wichtig: Request klonen. Ein Request ist ein Stream und
        // kann nur einmal konsumiert werden.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Prüfen ob valide Response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Wichtig: Response klonen
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function() {
          // Offline-Fallback
          return caches.match('/checklisten-app/index.html');
        });
      })
  );
});

// Alte Caches löschen
self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
