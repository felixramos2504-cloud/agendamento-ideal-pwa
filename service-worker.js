const CACHE_NAME = 'agendamento-ideal-pwa-v5-icon';

const STATIC_ASSETS = [
  './',
  './index.html',
  './config.js?v=9999',
  './manifest.webmanifest',
  './icon-192-v6.png',
  './icon-512-v6.png'
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

  if (
    url.hostname.indexOf('script.google.com') !== -1 ||
    url.hostname.indexOf('googleusercontent.com') !== -1
  ) {
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(function(cached) {
      if (cached) return cached;

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
