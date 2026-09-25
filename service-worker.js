const CACHE_NAME = 'agendamento-ideal-pwa-v7-icon';

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
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys.map(function(key) {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);

  if (
    url.hostname.indexOf('script.google.com') !== -1 ||
    url.hostname.indexOf('googleusercontent.com') !== -1
  ) {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  /*
   * INDEX / HTML
   * Busca primeiro a versão atualizada.
   */
  if (
    request.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname === '/'
  ) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(request, copy);
              });
          }

          return response;
        })
        .catch(function() {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   * MANIFEST
   * Busca primeiro a versão atualizada.
   */
  if (
    url.pathname.endsWith('/manifest.webmanifest') ||
    url.pathname.endsWith('/manifest.json')
  ) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(request, copy);
              });
          }

          return response;
        })
        .catch(function() {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   * ÍCONES V6
   * Busca primeiro a versão atualizada.
   */
  if (
    url.pathname.endsWith('/icon-192-v6.png') ||
    url.pathname.endsWith('/icon-512-v6.png')
  ) {
    event.respondWith(
      fetch(request)
        .then(function(response) {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(request, copy);
              });
          }

          return response;
        })
        .catch(function() {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   * DEMAIS ARQUIVOS
   * Cache primeiro para melhorar o desempenho.
   */
  event.respondWith(
    caches.match(request)
      .then(function(cached) {
        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(function(response) {
            if (response && response.ok) {
              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(request, copy);
                });
            }

            return response;
          });
      })
  );
});
