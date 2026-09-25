const CACHE_NAME = 'agendamento-ideal-pwa-v4-logo';
const STATIC_ASSETS = [
  './',
  './index.html',
  './config.js?v=9999',
  './manifest.webmanifest',
  './icon-192.png?v=2',
  './icon-512.png?v=2'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  // Nunca interceptar o Google Apps Script do sistema.
  if (
    url.hostname.indexOf('script.google.com') !== -1 ||
    url.hostname.indexOf('googleusercontent.com') !== -1
  ) {
    return;
  }

  // Somente recursos da própria PWA estática.
  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function(cached) {
      if (cached) {
        return cached;
      }

      return fetch(request).then(function(response) {
        if (response && response.ok) {
          var copy = response.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, copy);
          });
        }

        return response;
      });
    })
  );
});
